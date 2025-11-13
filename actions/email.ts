'use server';

import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import {
    createSignedToken,
    generateOTP,
    generateToken,
    verifySignedToken
} from '@/lib/crypto';
import { canSendVerification } from '@/lib/rate-limiter';
import { sendVerificationEmail } from '@/lib/mail';
import { createAuditLog } from '@/lib/audit/logger';

export async function sendEmailVerification(userId: string, email: string) {
    try {
        const headersList = await headers();
        const ipAddress =
            headersList.get('x-forwarded-for') ||
            headersList.get('x-real-ip') ||
            undefined;

        // Check rate limiting
        const rateLimitCheck = canSendVerification(email, ipAddress);
        if (!rateLimitCheck.allowed) {
            return { error: rateLimitCheck.reason };
        }

        // Generate token and OTP
        const token = generateToken();
        const otp = generateOTP();
        const iat = Math.floor(Date.now() / 1000);

        // Create HMAC signature
        const signedToken = createSignedToken({ userId, email, iat });

        // Store in database with 10 minute expiry
        const verification = await prisma.emailVerification.create({
            data: {
                userId,
                email,
                token,
                otp,
                signature: signedToken,
                ipAddress,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
            }
        });

        // Send email
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const magicLink = `${baseUrl}/auth/verify-email?token=${token}`;

        await sendVerificationEmail({
            to: email,
            magicLink,
            otp
        });

        await createAuditLog({
            action: 'email_verification.sent',
            entity: 'EmailVerification',
            entityId: verification.id,
            metadata: { email, userId }
        });

        return { success: true };
    } catch (error: any) {
        console.error('[v0] Email verification send error:', error);
        return { error: 'Failed to send verification email' };
    }
}

export async function verifyEmailWithToken(token: string) {
    try {
        const verification = await prisma.emailVerification.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!verification) {
            return { error: 'Invalid verification token' };
        }

        if (verification.verified) {
            return { error: 'This verification link has already been used' };
        }

        if (verification.expiresAt < new Date()) {
            return { error: 'This verification link has expired' };
        }

        // Verify HMAC signature
        const tokenData = verifySignedToken(verification.signature);
        if (
            !tokenData ||
            tokenData.userId !== verification.userId ||
            tokenData.email !== verification.email
        ) {
            return { error: 'Invalid verification signature' };
        }

        // Mark as verified
        await prisma.$transaction([
            prisma.emailVerification.update({
                where: { id: verification.id },
                data: {
                    verified: true,
                    usedAt: new Date()
                }
            }),
            prisma.user.update({
                where: { id: verification.userId },
                data: { emailVerified: true }
            })
        ]);

        await createAuditLog({
            action: 'email_verification.verified',
            entity: 'EmailVerification',
            entityId: verification.id,
            metadata: { email: verification.email, method: 'magic-link' }
        });

        return { success: true, userId: verification.userId };
    } catch (error: any) {
        console.error('[v0] Email verification error:', error);
        return { error: 'Failed to verify email' };
    }
}

export async function verifyEmailWithOTP(email: string, otp: string) {
    try {
        const verification = await prisma.emailVerification.findFirst({
            where: {
                email,
                otp,
                verified: false,
                expiresAt: { gte: new Date() }
            },
            include: { user: true }
        });

        if (!verification) {
            // Increment attempts
            await prisma.emailVerification.updateMany({
                where: {
                    email,
                    verified: false,
                    expiresAt: { gte: new Date() }
                },
                data: {
                    attempts: { increment: 1 }
                }
            });

            return { error: 'Invalid OTP code' };
        }

        if (verification.attempts >= 5) {
            return {
                error: 'Too many failed attempts. Please request a new verification code.'
            };
        }

        // Mark as verified
        await prisma.$transaction([
            prisma.emailVerification.update({
                where: { id: verification.id },
                data: {
                    verified: true,
                    usedAt: new Date()
                }
            }),
            prisma.user.update({
                where: { id: verification.userId },
                data: { emailVerified: true }
            })
        ]);

        await createAuditLog({
            action: 'email_verification.verified',
            entity: 'EmailVerification',
            entityId: verification.id,
            metadata: { email: verification.email, method: 'otp' }
        });

        return { success: true, userId: verification.userId };
    } catch (error: any) {
        console.error('[v0] OTP verification error:', error);
        return { error: 'Failed to verify OTP' };
    }
}

export async function resendVerification(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return { error: 'User not found' };
        }

        if (user.emailVerified) {
            return { error: 'Email is already verified' };
        }

        // Invalidate old verifications
        await prisma.emailVerification.updateMany({
            where: {
                userId: user.id,
                verified: false
            },
            data: {
                expiresAt: new Date(0) // Mark as expired
            }
        });

        return await sendEmailVerification(user.id, user.email);
    } catch (error: any) {
        console.error('[v0] Resend verification error:', error);
        return { error: 'Failed to resend verification' };
    }
}
