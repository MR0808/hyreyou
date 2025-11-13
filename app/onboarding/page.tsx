import { Metadata } from 'next';

import { getOnboardingProgress } from '@/actions/onboarding';
import OnboardingFlow from '@/components/onboarding/OnBoardingFlow';
import { requireEmailVerification } from '@/lib/email-verification';
import EmailVerificationBanner from '@/components/global/EmailVerificationBanner';
import { authCheck } from '@/lib/authCheck';

export function generateMetadata(): Metadata {
    return {
        title: 'Complete Your Profile | HyreYou',
        description: 'Create your verified résumé in minutes'
    };
}

const OnboardingPage = async () => {
    const session = await authCheck('/onboarding');

    const { verified, user } = await requireEmailVerification();

    const { profile, currentStep, completionScore } =
        await getOnboardingProgress();

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            {!verified && user && (
                <div className="mb-6">
                    <EmailVerificationBanner email={user.email} />
                </div>
            )}

            <OnboardingFlow
                initialProfile={profile}
                initialStep={currentStep}
                initialCompletionScore={completionScore}
                user={session.user}
            />
        </div>
    );
};

export default OnboardingPage;
