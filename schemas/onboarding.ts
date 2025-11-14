import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

export const basicDetailsSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    headline: z
        .string()
        .min(10, 'Headline must be at least 10 characters')
        .max(100, 'Headline must be less than 100 characters'),
    city: z.string().min(2, 'City is required'),
    state: z.string().optional(),
    country: z.string().min(2, 'Country is required'),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || isValidPhoneNumber(val), {
            message: 'Invalid phone number'
        })
});

export const workExperienceSchema = z
    .object({
        company: z.string().min(2, 'Company name is required'),
        title: z.string().min(2, 'Job title is required'),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        startDate: z.string().min(1, 'Start date is required'),
        endDate: z.string().optional(),
        current: z.boolean(),
        description: z.string().optional()
    })
    .refine(
        (data) => {
            if (!data.current && data.endDate && data.startDate) {
                return new Date(data.startDate) <= new Date(data.endDate);
            }
            return true;
        },
        {
            message: 'Start date must be before or equal to end date',
            path: ['endDate']
        }
    );

export const educationSchema = z
    .object({
        institution: z.string().min(2, 'Institution name is required'),
        degree: z.string().min(2, 'Degree is required'),
        field: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        current: z.boolean(),
        description: z.string().optional()
    })
    .refine(
        (data) => {
            if (!data.current && data.endDate && data.startDate) {
                return new Date(data.startDate) <= new Date(data.endDate);
            }
            return true;
        },
        {
            message: 'Start date must be before or equal to end date',
            path: ['endDate']
        }
    );

export const skillsSchema = z.object({
    skills: z
        .array(
            z.object({
                name: z.string(),
                category: z.string(),
                level: z.string().optional(),
                yearsExp: z.number().optional()
            })
        )
        .min(1, 'Add at least one skill')
});

export const certificationSchema = z.object({
    name: z.string().min(2, 'Certification name is required'),
    issuer: z.string().min(2, 'Issuer is required'),
    issueDate: z.string().optional(),
    expiryDate: z.string().optional(),
    credentialId: z.string().optional(),
    credentialUrl: z.string().url().optional().or(z.literal(''))
});

export const profilePhotoSchema = z.object({
    image: z.string().optional(),
    profileVisibility: z.enum(['public', 'private', 'recruiter-only']),
    searchable: z.boolean()
});

export type BasicDetailsInput = z.infer<typeof basicDetailsSchema>;
export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type SkillsInput = z.infer<typeof skillsSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type ProfilePhotoInput = z.infer<typeof profilePhotoSchema>;
