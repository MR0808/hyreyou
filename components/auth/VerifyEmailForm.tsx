'use client';

import { useState, useTransition, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    verifyEmailWithToken,
    verifyEmailWithOTP,
    resendVerification
} from '@/actions/email';
import { OTPFormData, otpSchema } from '@/schemas/email-verify';

const VerifyEmailForm = ({ userEmail }: { userEmail: string }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [isPending, startTransition] = useTransition();
    const [isResending, setIsResending] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [showOTPForm, setShowOTPForm] = useState(!token);

    const form = useForm<OTPFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: ''
        }
    });

    // Auto-verify if token is present
    useEffect(() => {
        if (token && !isVerified) {
            startTransition(async () => {
                const result = await verifyEmailWithToken(token);

                if (result.error) {
                    toast.error('Verification failed', {
                        description: result.error
                    });
                    setShowOTPForm(true);
                } else {
                    setIsVerified(true);
                    toast.success('Email verified!', {
                        description: 'Redirecting to onboarding...'
                    });

                    setTimeout(() => {
                        router.push('/onboarding');
                    }, 2000);
                }
            });
        }
    }, [token, isVerified, router]);

    async function onSubmitOTP(data: OTPFormData) {
        if (!email) {
            toast.error('Email address is required');
            return;
        }

        startTransition(async () => {
            const result = await verifyEmailWithOTP(email, data.otp);

            if (result.error) {
                toast.error('Verification failed', {
                    description: result.error
                });
            } else {
                setIsVerified(true);
                toast.success('Email verified!', {
                    description: 'Redirecting to onboarding...'
                });

                setTimeout(() => {
                    router.push('/onboarding');
                }, 2000);
            }
        });
    }

    async function handleResend() {
        if (!email && !userEmail) {
            toast.error('Email address is required');
            return;
        }

        setIsResending(true);
        const result = await resendVerification(email || userEmail);
        setIsResending(false);

        if (result.error) {
            toast.error('Failed to resend', {
                description: result.error
            });
        } else {
            toast.success('Verification email sent!', {
                description: 'Check your inbox for a new verification code.'
            });
        }
    }

    if (isVerified) {
        return (
            <div className="space-y-6 text-center">
                <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 p-3">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-heading font-bold mb-2">
                        Email Verified!
                    </h1>
                    <p className="text-muted-foreground">
                        Your email has been successfully verified. Redirecting
                        you now...
                    </p>
                </div>
            </div>
        );
    }

    if (token && isPending) {
        return (
            <div className="space-y-6 text-center">
                <div className="flex justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
                <div>
                    <h1 className="text-2xl font-heading font-bold mb-2">
                        Verifying your email...
                    </h1>
                    <p className="text-muted-foreground">
                        Please wait while we verify your email address.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-primary/10 p-3">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h1 className="text-2xl font-heading font-bold">
                    Verify your email
                </h1>
                <p className="text-sm text-muted-foreground">
                    We sent a verification code to <strong>{email}</strong>
                </p>
            </div>

            <Alert>
                <AlertDescription className="text-sm">
                    Check your inbox for a verification email. Click the magic
                    link or enter the 6-digit code below.
                </AlertDescription>
            </Alert>

            {showOTPForm && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmitOTP)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="000000"
                                            maxLength={6}
                                            className="text-center text-2xl tracking-widest font-mono"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending}
                        >
                            {isPending ? 'Verifying...' : 'Verify Email'}
                        </Button>
                    </form>
                </Form>
            )}

            <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive the email?
                </p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={isResending || isPending}
                >
                    {isResending ? 'Sending...' : 'Resend verification email'}
                </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
                The verification link expires in 10 minutes for security.
            </p>
        </div>
    );
};

export default VerifyEmailForm;
