export interface OnboardingFlowProps {
    initialProfile: any;
    initialStep: number;
    initialCompletionScore: number;
    user: any;
}

export interface BasicDetailsStepProps {
    profile: any;
    onNext: () => void;
    onPrevious: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
}

export interface ExperienceStepProps {
    profile: any;
    onNext: () => void;
    onPrevious: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
}

export interface EducationStepProps {
    profile: any;
    onNext: () => void;
    onPrevious: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
}

export interface SkillsStepProps {
    profile: any;
    onNext: () => void;
    onPrevious: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
}

export interface CertificationsStepProps {
    profile: any;
    onNext: () => void;
    onPrevious: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
}

export interface ProfilePhotoStepProps {
    profile: any;
    onNext: () => void;
    onPrevious: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
}
