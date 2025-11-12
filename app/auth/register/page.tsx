import { Metadata } from 'next';

import RegisterForm from '@/components/auth/RegisterForm';
import AuthLayout from '@/components/auth/AuthLayout';

export function generateMetadata(): Metadata {
    return {
        title: 'Register',
        description: 'Hyreyou Registration'
    };
}

export default function RegisterPage() {
    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    );
}
