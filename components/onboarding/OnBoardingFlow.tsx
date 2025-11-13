'use client';

import { useState } from 'react';
import BasicDetailsStep from '@/components/onboarding/steps/BasicDetailsStep';
import ExperienceStep from '@/components/onboarding/steps/ExperienceStep';
import EducationStep from '@/components/onboarding/steps/EducationStep';
import SkillsStep from '@/components/onboarding/steps/SkillsStep';
import CertificationsStep from '@/components/onboarding/steps/CertificationsStep';
import ProfilePhotoStep from '@/components/onboarding/steps/ProfilePhotoStep';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { OnboardingFlowProps } from '@/types/onboarding';

const STEPS = [
    { number: 1, title: 'Basic Details', component: BasicDetailsStep },
    { number: 2, title: 'Experience', component: ExperienceStep },
    { number: 3, title: 'Education', component: EducationStep },
    { number: 4, title: 'Skills', component: SkillsStep },
    { number: 5, title: 'Certifications', component: CertificationsStep },
    { number: 6, title: 'Profile & Visibility', component: ProfilePhotoStep }
];

const OnboardingFlow = ({
    initialProfile,
    initialStep,
    initialCompletionScore,
    user
}: OnboardingFlowProps) => {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [completionScore, setCompletionScore] = useState(
        initialCompletionScore
    );

    const CurrentStepComponent = STEPS[currentStep - 1]?.component;

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-slate-900">
                    Welcome to HyreYou, {user.name?.split(' ')[0]}!
                </h1>
                <p className="text-lg text-slate-600">
                    {"Let's create your verified résumé in just a few minutes"}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">
                        Step {currentStep} of {STEPS.length}
                    </span>
                    <span className="text-sm font-medium text-teal-600">
                        {completionScore}% Complete
                    </span>
                </div>
                <Progress
                    value={(currentStep / STEPS.length) * 100}
                    className="h-2"
                />
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between">
                {STEPS.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                                    currentStep > step.number
                                        ? 'bg-teal-600 border-teal-600 text-white'
                                        : currentStep === step.number
                                          ? 'bg-slate-blue border-slate-blue text-white'
                                          : 'bg-white border-slate-300 text-slate-400'
                                }`}
                            >
                                {currentStep > step.number ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                    <span className="text-sm font-semibold">
                                        {step.number}
                                    </span>
                                )}
                            </div>
                            <span className="mt-2 text-xs text-slate-600 text-center max-w-20">
                                {step.title}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div
                                className={`h-0.5 w-12 mx-2 ${currentStep > step.number ? 'bg-teal-600' : 'bg-slate-300'}`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Current Step Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                {CurrentStepComponent && (
                    <CurrentStepComponent
                        profile={initialProfile}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        isFirstStep={currentStep === 1}
                        isLastStep={currentStep === STEPS.length}
                    />
                )}
            </div>
        </div>
    );
};

export default OnboardingFlow;
