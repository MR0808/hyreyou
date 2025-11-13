import { Metadata } from 'next';

import LoginForm from '@/components/auth/LoginForm';
import AuthLayout from '@/components/auth/AuthLayout';

export function generateMetadata(): Metadata {
    return {
        title: 'Login',
        description: 'Sign in to your HyreYou account'
    };
}

export default function LoginPage() {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    );
}
