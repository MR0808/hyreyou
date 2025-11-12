import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center space-y-2">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/images/assets/logo.png"
                                alt="HyreYou"
                                width={280}
                                height={80}
                                className="h-16 w-auto"
                                priority
                            />
                        </Link>
                        <p className="text-sm text-muted-foreground text-center">
                            Creating seamless connections
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="mt-8">{children}</div>
                </div>
            </div>

            {/* Right Side - Brand Visual */}
            <div className="hidden lg:flex items-center justify-center bg-linear-to-br from-primary/10 via-secondary/5 to-background p-12">
                <div className="max-w-md space-y-6 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-heading font-bold text-balance">
                            One Profile,
                            <br />
                            <span className="text-primary">
                                Unlimited Opportunities
                            </span>
                        </h2>
                        <p className="text-muted-foreground text-pretty leading-relaxed">
                            Create your verified digital résumé and connect with
                            recruiters who value authenticity and trust.
                        </p>
                    </div>

                    {/* Feature badges */}
                    <div className="flex flex-wrap gap-3 justify-center pt-8">
                        <div className="px-4 py-2 rounded-lg bg-card border border-border">
                            <span className="text-sm font-medium">
                                ✓ AI-Assisted
                            </span>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-card border border-border">
                            <span className="text-sm font-medium">
                                ✓ Verified Skills
                            </span>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-card border border-border">
                            <span className="text-sm font-medium">
                                ✓ Trusted by Recruiters
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
