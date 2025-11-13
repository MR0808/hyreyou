'use server';

import { prisma } from '@/lib/prisma';
import { authCheckServer } from '@/lib/authCheck';

export async function requireEmailVerification() {
    const session = await authCheckServer();

    if (!session) {
        return { verified: false, user: null };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, emailVerified: true, name: true }
    });

    if (!user) {
        return { verified: false, user: null };
    }

    return {
        verified: user.emailVerified,
        user
    };
}

export async function checkEmailVerificationStatus(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { emailVerified: true }
    });

    return user?.emailVerified || false;
}
