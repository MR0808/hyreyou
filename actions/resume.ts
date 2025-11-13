'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit/logger';

async function getAuthUser() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    return session.user;
}

export async function getResumeData() {
    try {
        const user = await getAuthUser();

        const profile = await prisma.candidateProfile.findUnique({
            where: { userId: user.id },
            include: {
                workExperience: {
                    orderBy: { startDate: 'desc' }
                },
                education: {
                    orderBy: { startDate: 'desc' }
                },
                skills: {
                    include: { skill: true }
                },
                certifications: {
                    orderBy: { issueDate: 'desc' }
                }
            }
        });

        if (!profile) {
            return { success: false, error: 'Profile not found' };
        }

        await createAuditLog({
            action: 'candidate.resume.viewed',
            entity: 'CandidateProfile',
            entityId: profile.id
        });

        return {
            success: true,
            data: {
                user: {
                    name: `${profile.firstName} ${profile.lastName}`,
                    email: user.email,
                    phone: profile.phone,
                    location: profile.location,
                    headline: profile.headline,
                    linkedinUrl: profile.linkedinUrl,
                    portfolioUrl: profile.portfolioUrl
                },
                summary: profile.summary,
                experience: profile.workExperience,
                education: profile.education,
                skills: profile.skills,
                certifications: profile.certifications
            }
        };
    } catch (error) {
        console.error('[v0] Error getting resume data:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to get resume data'
        };
    }
}

export async function generateResumeShareLink() {
    try {
        const user = await getAuthUser();

        const profile = await prisma.candidateProfile.findUnique({
            where: { userId: user.id }
        });

        if (!profile) {
            throw new Error('Profile not found');
        }

        // Generate shareable link (in production, you'd create a unique token)
        const shareLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/u/${user.id}`;

        await createAuditLog({
            action: 'candidate.resume.shared',
            entity: 'CandidateProfile',
            entityId: profile.id,
            metadata: { shareLink }
        });

        return {
            success: true,
            shareLink
        };
    } catch (error) {
        console.error('[v0] Error generating share link:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to generate share link'
        };
    }
}
