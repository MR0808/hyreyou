import { getOnboardingProgress } from '@/actions/onboarding';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const { profile } = await getOnboardingProgress();

    // If profile is complete, redirect to dashboard
    if (profile && profile.completionScore === 100) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-teal-50">
            {children}
        </div>
    );
}
