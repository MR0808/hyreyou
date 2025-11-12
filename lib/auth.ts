import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { UserRole, Gender } from '@/generated/prisma';
import { customSession, openAPI } from 'better-auth/plugins';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/argon2';
import { sendVerificationEmail, sendResetEmail } from '@/lib/mail';
import { createAuditLog } from '@/lib/audit/helpers';
import { AUDIT_ACTIONS } from '@/types/audit';

const options = {
    database: prismaAdapter(prisma, {
        provider: 'postgresql' // or "mysql", "postgresql", ...etc
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            enabled: !!process.env.GOOGLE_CLIENT_ID
        },
        linkedin: {
            clientId: process.env.LINKEDIN_CLIENT_ID as string,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
            enabled: !!process.env.LINKEDIN_CLIENT_ID
        }
    },
    emailAndPassword: {
        enabled: true,
        password: {
            hash: hashPassword,
            verify: verifyPassword
        },
        autoSignIn: false,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url }) => {
            await sendResetEmail({
                email: user.email,
                link: url,
                name: user.name
            });
        }
    },
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            // const newSession = ctx.context.newSession;
            if (ctx.path === '/forget-password') {
                // await logPasswordResetRequested(ctx.body.email);
                await createAuditLog({
                    userId: ctx.body.email,
                    action: AUDIT_ACTIONS.USER_PASSWORD_RESET_REQUESTED,
                    entity: 'user',
                    entityId: undefined,
                    metadata: {
                        email: ctx.body.email
                    }
                });
            }
        })
    },
    advanced: {
        database: {
            generateId: false
        }
    },
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async (
                { user, newEmail, url, token },
                request
            ) => {
                await sendVerificationEmail({
                    email: newEmail,
                    otp: token,
                    name: user.name
                });
            }
        },
        additionalFields: {
            lastName: {
                type: 'string',
                required: true
            },
            role: {
                type: ['CANDIDATE', 'ADMIN', 'RECRUITER'] as Array<UserRole>
            },
            gender: {
                type: ['MALE', 'FEMALE', 'OTHER', 'NOTSAY'] as Array<Gender>,
                required: false
            },
            dateOfBirth: {
                type: 'date',
                required: false
            },
            countryId: {
                type: 'string',
                required: false
            },
            regionId: {
                type: 'string',
                required: false
            },
            phoneNumber: {
                type: 'string',
                required: false
            },
            phoneVerified: {
                type: 'boolean',
                required: false
            },
            emailVerified: {
                type: 'boolean',
                required: false
            },
            timezone: {
                type: 'string',
                required: false
            },
            locale: {
                type: 'string',
                required: false
            },
            bio: {
                type: 'string',
                required: false
            }
        }
    },
    session: {
        expiresIn: 30 * 24 * 60 * 60,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60
        }
    },
    account: {
        accountLinking: {
            enabled: false
        }
    },
    plugins: [nextCookies()]
} satisfies BetterAuthOptions;

export const auth = betterAuth({
    ...options,
    plugins: [
        ...(options.plugins ?? []),
        customSession(async ({ user, session }, ctx) => {
            const accounts = await prisma.account.findMany({
                where: { id: user.id }
            });
            return {
                session,
                user,
                accounts
            };
        }, options),
        openAPI()
    ]
});

export type ErrorCode = keyof typeof auth.$ERROR_CODES | 'UNKNOWN';
