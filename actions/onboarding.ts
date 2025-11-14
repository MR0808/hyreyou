'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import {
    basicDetailsSchema,
    workExperienceSchema,
    educationSchema,
    skillsSchema,
    certificationSchema,
    profilePhotoSchema,
    type BasicDetailsInput,
    type WorkExperienceInput,
    type EducationInput,
    type SkillsInput,
    type CertificationInput,
    type ProfilePhotoInput
} from '@/schemas/onboarding';
import { createAuditLog } from '@/lib/audit/logger';
import { getAuthUser } from '@/lib/authCheck';

export const saveBasicDetails = async (data: BasicDetailsInput) => {
    try {
        const user = await getAuthUser();
        const validated = basicDetailsSchema.parse(data);

        // Check if profile exists
        const existingProfile = await prisma.candidateProfile.findUnique({
            where: { userId: user.id }
        });

        let profile;
        if (existingProfile) {
            profile = await prisma.candidateProfile.update({
                where: { userId: user.id },
                data: {
                    firstName: validated.firstName,
                    lastName: validated.lastName,
                    headline: validated.headline,
                    city: validated.city,
                    state: validated.state,
                    country: validated.country,
                    phone: validated.phone,
                    completionScore: calculateCompletionScore({
                        basicDetails: true
                    })
                }
            });
        } else {
            profile = await prisma.candidateProfile.create({
                data: {
                    userId: user.id,
                    firstName: validated.firstName,
                    lastName: validated.lastName,
                    headline: validated.headline,
                    city: validated.city,
                    state: validated.state,
                    country: validated.country,
                    phone: validated.phone,
                    completionScore: calculateCompletionScore({
                        basicDetails: true
                    })
                }
            });
        }

        await createAuditLog({
            action: 'candidate.profile.updated',
            entity: 'CandidateProfile',
            entityId: profile.id,
            metadata: { step: 'basic-details' }
        });

        revalidatePath('/onboarding');
        return { success: true, profileId: profile.id };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to save basic details'
        };
    }
};

export const addWorkExperience = async (data: WorkExperienceInput) => {
    try {
        const user = await getAuthUser();
        const validated = workExperienceSchema.parse(data);

        const profile = await prisma.candidateProfile.findUnique({
            where: { userId: user.id }
        });

        if (!profile) {
            throw new Error('Profile not found');
        }

        const experience = await prisma.workExperience.create({
            data: {
                profileId: profile.id,
                company: validated.company,
                title: validated.title,
                city: validated.city,
                state: validated.state,
                country: validated.country,
                startDate: new Date(validated.startDate),
                endDate: validated.endDate ? new Date(validated.endDate) : null,
                current: validated.current,
                description: validated.description
            }
        });

        // Update completion score
        const experienceCount = await prisma.workExperience.count({
            where: { profileId: profile.id }
        });

        await prisma.candidateProfile.update({
            where: { id: profile.id },
            data: {
                completionScore: calculateCompletionScore({
                    basicDetails: true,
                    hasExperience: experienceCount > 0
                })
            }
        });

        await createAuditLog({
            action: 'candidate.experience.created',
            entity: 'WorkExperience',
            entityId: experience.id,
            metadata: { company: validated.company, title: validated.title }
        });

        revalidatePath('/onboarding');
        return { success: true, data: experience };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to add work experience'
        };
    }
};

export const updateWorkExperience = async (
    experienceId: string,
    data: WorkExperienceInput
) => {
    try {
        const user = await getAuthUser();
        const validated = workExperienceSchema.parse(data);

        const experience = await prisma.workExperience.findUnique({
            where: { id: experienceId },
            include: { profile: true }
        });

        if (!experience || experience.profile.userId !== user.id) {
            throw new Error('Experience not found or unauthorized');
        }

        const updatedExperience = await prisma.workExperience.update({
            where: { id: experienceId },
            data: {
                company: validated.company,
                title: validated.title,
                city: validated.city,
                state: validated.state,
                country: validated.country,
                startDate: new Date(validated.startDate),
                endDate: validated.endDate ? new Date(validated.endDate) : null,
                current: validated.current,
                description: validated.description
            }
        });

        await createAuditLog({
            action: 'candidate.experience.updated',
            entity: 'WorkExperience',
            entityId: experienceId,
            metadata: { company: validated.company, title: validated.title }
        });

        revalidatePath('/onboarding');
        return { success: true, data: updatedExperience };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update work experience'
        };
    }
};

export const deleteWorkExperience = async (experienceId: string) => {
    try {
        const user = await getAuthUser();

        const experience = await prisma.workExperience.findUnique({
            where: { id: experienceId },
            include: { profile: true }
        });

        if (!experience || experience.profile.userId !== user.id) {
            throw new Error('Experience not found or unauthorized');
        }

        await prisma.workExperience.delete({
            where: { id: experienceId }
        });

        await createAuditLog({
            action: 'candidate.experience.deleted',
            entity: 'WorkExperience',
            entityId: experienceId
        });

        revalidatePath('/onboarding');
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete work experience'
        };
    }
};

export const addEducation = async (data: EducationInput) => {
    try {
        const user = await getAuthUser();
        const validated = educationSchema.parse(data);

        const profile = await prisma.candidateProfile.findUnique({
            where: { userId: user.id }
        });

        if (!profile) {
            throw new Error('Profile not found');
        }

        const education = await prisma.education.create({
            data: {
                profileId: profile.id,
                institution: validated.institution,
                degree: validated.degree,
                field: validated.field,
                city: validated.city,
                state: validated.state,
                country: validated.country,
                startDate: validated.startDate
                    ? new Date(validated.startDate)
                    : null,
                endDate: validated.endDate ? new Date(validated.endDate) : null,
                current: validated.current,
                description: validated.description
            }
        });

        const educationCount = await prisma.education.count({
            where: { profileId: profile.id }
        });

        await prisma.candidateProfile.update({
            where: { id: profile.id },
            data: {
                completionScore: calculateCompletionScore({
                    basicDetails: true,
                    hasExperience: true,
                    hasEducation: educationCount > 0
                })
            }
        });

        await createAuditLog({
            action: 'candidate.education.created',
            entity: 'Education',
            entityId: education.id,
            metadata: {
                institution: validated.institution,
                degree: validated.degree
            }
        });

        revalidatePath('/onboarding');
        return { success: true, data: education };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to add education'
        };
    }
};

export const updateEducation = async (
    educationId: string,
    data: EducationInput
) => {
    try {
        const user = await getAuthUser();
        const validated = educationSchema.parse(data);

        const education = await prisma.education.findUnique({
            where: { id: educationId },
            include: { profile: true }
        });

        if (!education || education.profile.userId !== user.id) {
            throw new Error('Education not found or unauthorized');
        }

        const updatedEducation = await prisma.education.update({
            where: { id: educationId },
            data: {
                institution: validated.institution,
                degree: validated.degree,
                field: validated.field,
                city: validated.city,
                state: validated.state,
                country: validated.country,
                startDate: validated.startDate
                    ? new Date(validated.startDate)
                    : null,
                endDate: validated.endDate ? new Date(validated.endDate) : null,
                current: validated.current,
                description: validated.description
            }
        });

        await createAuditLog({
            action: 'candidate.education.updated',
            entity: 'Education',
            entityId: educationId,
            metadata: {
                institution: validated.institution,
                degree: validated.degree
            }
        });

        revalidatePath('/onboarding');
        return { success: true, data: updatedEducation };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update education'
        };
    }
};

export const deleteEducation = async (educationId: string) => {
    try {
        const user = await getAuthUser();

        const education = await prisma.education.findUnique({
            where: { id: educationId },
            include: { profile: true }
        });

        if (!education || education.profile.userId !== user.id) {
            throw new Error('Education not found or unauthorized');
        }

        await prisma.education.delete({
            where: { id: educationId }
        });

        await createAuditLog({
            action: 'candidate.education.deleted',
            entity: 'Education',
            entityId: educationId
        });

        revalidatePath('/onboarding');
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete education'
        };
    }
};

export const saveSkills = async (data: SkillsInput) => {
    try {
        const user = await getAuthUser();
        const validated = skillsSchema.parse(data);

        const profile = await prisma.candidateProfile.findUnique({
            where: { userId: user.id }
        });

        if (!profile) {
            throw new Error('Profile not found');
        }

        // Create or get skills and link to candidate
        for (const skillData of validated.skills) {
            // Find or create skill
            let skill = await prisma.skill.findUnique({
                where: { name: skillData.name }
            });

            if (!skill) {
                skill = await prisma.skill.create({
                    data: {
                        name: skillData.name,
                        category: skillData.category
                    }
                });
            }

            // Check if already linked
            const existing = await prisma.candidateSkill.findUnique({
                where: {
                    profileId_skillId: {
                        profileId: profile.id,
                        skillId: skill.id
                    }
                }
            });

            if (!existing) {
                await prisma.candidateSkill.create({
                    data: {
                        profileId: profile.id,
                        skillId: skill.id,
                        level: skillData.level,
                        yearsExp: skillData.yearsExp
                    }
                });
            }
        }

        const skillCount = await prisma.candidateSkill.count({
            where: { profileId: profile.id }
        });

        await prisma.candidateProfile.update({
            where: { id: profile.id },
            data: {
                completionScore: calculateCompletionScore({
                    basicDetails: true,
                    hasExperience: true,
                    hasEducation: true,
                    hasSkills: skillCount > 0
                })
            }
        });

        await createAuditLog({
            action: 'candidate.skills.updated',
            entity: 'CandidateProfile',
            entityId: profile.id,
            metadata: { skillCount: validated.skills.length }
        });

        revalidatePath('/onboarding');
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'Failed to save skills'
        };
    }
};

export const addCertification = async (data: CertificationInput) => {
    try {
        const user = await getAuthUser();
        const validated = certificationSchema.parse(data);

        const profile = await prisma.candidateProfile.findUnique({
            where: { userId: user.id }
        });

        if (!profile) {
            throw new Error('Profile not found');
        }

        const certification = await prisma.certification.create({
            data: {
                profileId: profile.id,
                name: validated.name,
                issuer: validated.issuer,
                issueDate: validated.issueDate
                    ? new Date(validated.issueDate)
                    : null,
                expiryDate: validated.expiryDate
                    ? new Date(validated.expiryDate)
                    : null,
                credentialId: validated.credentialId,
                credentialUrl: validated.credentialUrl
            }
        });

        await createAuditLog({
            action: 'candidate.certification.created',
            entity: 'Certification',
            entityId: certification.id,
            metadata: { name: validated.name, issuer: validated.issuer }
        });

        revalidatePath('/onboarding');
        return { success: true, certificationId: certification.id };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to add certification'
        };
    }
};

export const deleteCertification = async (certificationId: string) => {
    try {
        const user = await getAuthUser();

        const certification = await prisma.certification.findUnique({
            where: { id: certificationId },
            include: { profile: true }
        });

        if (!certification || certification.profile.userId !== user.id) {
            throw new Error('Certification not found or unauthorized');
        }

        await prisma.certification.delete({
            where: { id: certificationId }
        });

        await createAuditLog({
            action: 'candidate.certification.deleted',
            entity: 'Certification',
            entityId: certificationId
        });

        revalidatePath('/onboarding');
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete certification'
        };
    }
};

export const saveProfilePhoto = async (data: ProfilePhotoInput) => {
    try {
        const user = await getAuthUser();
        const validated = profilePhotoSchema.parse(data);

        const profile = await prisma.candidateProfile.findUnique({
            where: { userId: user.id }
        });

        if (!profile) {
            throw new Error('Profile not found');
        }

        // Update user image if provided
        if (validated.image) {
            await prisma.user.update({
                where: { id: user.id },
                data: { image: validated.image }
            });
        }

        // Update profile visibility settings
        await prisma.candidateProfile.update({
            where: { id: profile.id },
            data: {
                profileVisibility: validated.profileVisibility,
                searchable: validated.searchable,
                completionScore: 100 // Profile complete!
            }
        });

        await createAuditLog({
            action: 'candidate.profile.completed',
            entity: 'CandidateProfile',
            entityId: profile.id,
            metadata: { visibility: validated.profileVisibility }
        });

        revalidatePath('/onboarding');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to save profile settings'
        };
    }
};

export const getOnboardingProgress = async () => {
    try {
        const user = await getAuthUser();

        const profile = await prisma.candidateProfile.findUnique({
            where: { userId: user.id },
            include: {
                workExperience: true,
                education: true,
                skills: { include: { skill: true } },
                certifications: true
            }
        });

        if (!profile) {
            return {
                profile: null,
                currentStep: 1,
                completionScore: 0
            };
        }

        // Determine current step based on completion
        let currentStep = 1;
        if (profile.headline && profile.city && profile.country)
            currentStep = 2;
        if (profile.workExperience.length > 0) currentStep = 3;
        if (profile.education.length > 0) currentStep = 4;
        if (profile.skills.length > 0) currentStep = 5;
        if (profile.completionScore === 100) currentStep = 6;

        return {
            profile,
            currentStep,
            completionScore: profile.completionScore
        };
    } catch (error) {
        return {
            profile: null,
            currentStep: 1,
            completionScore: 0
        };
    }
};

// Helper function to calculate completion score
const calculateCompletionScore = (progress: {
    basicDetails?: boolean;
    hasExperience?: boolean;
    hasEducation?: boolean;
    hasSkills?: boolean;
    hasPhoto?: boolean;
}) => {
    let score = 0;
    if (progress.basicDetails) score += 20;
    if (progress.hasExperience) score += 30;
    if (progress.hasEducation) score += 20;
    if (progress.hasSkills) score += 20;
    if (progress.hasPhoto) score += 10;
    return score;
};
