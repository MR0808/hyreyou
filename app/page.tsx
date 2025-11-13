import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getDashboardData } from '@/actions/dashboard';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { requireEmailVerification } from '@/lib/email-verification';
import EmailVerificationBanner from '@/components/global/EmailVerificationBanner';
import { authCheck } from '@/lib/authCheck';

export function generateMetadata(): Metadata {
    return {
        title: 'Dashboard | HyreYou',
        description: 'Manage your profile and applications'
    };
}

export default async function DashboardPage() {
    await authCheck();

    const { verified, user } = await requireEmailVerification();

    const result = await getDashboardData();

    if (!result.success || !result.data) {
        redirect('/onboarding');
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {!verified && user && (
                <div className="sticky top-0 z-50 p-4">
                    <EmailVerificationBanner email={user.email} />
                </div>
            )}

            <DashboardOverview data={result.data} />
        </div>
    );
}
