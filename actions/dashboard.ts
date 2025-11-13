'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/authCheck';

export const getDashboardData = async () => {
    try {
        const user = await getAuthUser();

        const profile = await prisma.candidateProfile.findUnique({
            where: { userId: user.id },
            include: {
                workExperience: true,
                education: true,
                skills: true,
                certifications: true,
                applications: {
                    include: {
                        job: {
                            include: {
                                organisation: true
                            }
                        }
                    },
                    orderBy: { appliedAt: 'desc' },
                    take: 5
                }
            }
        });

        if (!profile) {
            return { success: false, error: 'Profile not found' };
        }

        // Calculate profile strength metrics
        const metrics = {
            completionScore: profile.completionScore,
            profileViews: profile.profileViews,
            applicationCount: await prisma.application.count({
                where: { profileId: profile.id }
            }),
            hasResume: !!profile.resumeUrl,
            emailVerified: user.emailVerified
        };

        // Get profile completion tips
        const completionTips = [];
        if (!profile.summary) completionTips.push('Add a professional summary');
        if (profile.workExperience.length === 0)
            completionTips.push('Add work experience');
        if (profile.skills.length < 5) completionTips.push('Add more skills');
        if (profile.certifications.length === 0)
            completionTips.push('Add certifications');
        if (!user.emailVerified) completionTips.push('Verify your email');

        return {
            success: true,
            data: {
                user,
                profile,
                metrics,
                completionTips
            }
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to get dashboard data'
        };
    }
};
