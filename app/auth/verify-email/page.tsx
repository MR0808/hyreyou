import { Suspense } from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import VerifyEmailForm from '@/components/auth/VerifyEmailForm';
import { auth } from '@/lib/auth';

export function generateMetadata(): Metadata {
    return {
        title: 'Verify Email | HyreYou',
        description: 'Verify your email address to complete registration'
    };
}

const VerifyEmailPage = async () => {
    const headerList = await headers();

    const session = await auth.api.getSession({
        headers: headerList
    });

    if (!session) {
        return redirect('/auth/login');
    }

    if (session && session.user.emailVerified) {
        return redirect('/');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Image
                        src="/images/assets/logo.png"
                        alt="HyreYou"
                        width={200}
                        height={60}
                        priority
                    />
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                    <Suspense fallback={<div>Loading...</div>}>
                        <VerifyEmailForm userEmail={session.user.email} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
