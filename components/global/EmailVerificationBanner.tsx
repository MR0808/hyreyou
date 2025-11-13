'use client';

import { useState, useTransition } from 'react';
import { Mail, X } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { resendVerification } from '@/actions/email';
import { EmailVerificationBannerProps } from '@/schemas/email-verify';

const EmailVerificationBanner = ({ email }: EmailVerificationBannerProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isPending, startTransition] = useTransition();

    if (!isVisible) return null;

    const handleResend = () => {
        startTransition(async () => {
            const result = await resendVerification(email);

            if (result.error) {
                toast.error('Failed to resend', {
                    description: result.error
                });
            } else {
                toast.success('Verification email sent!', {
                    description: 'Check your inbox for a new verification code.'
                });
            }
        });
    };

    return (
        <Alert className="relative bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Email not verified.</strong> Please check your
                        inbox and verify your email address to access all
                        features.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResend}
                        disabled={isPending}
                        className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900 bg-transparent"
                    >
                        {isPending ? 'Sending...' : 'Resend'}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsVisible(false)}
                        className="hover:bg-amber-100 dark:hover:bg-amber-900"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
    );
};

export default EmailVerificationBanner;
