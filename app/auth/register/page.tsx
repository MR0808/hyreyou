import { Metadata } from 'next';

import RegisterForm from '@/components/auth/RegisterForm';
import AuthLayout from '@/components/auth/AuthLayout';
import { isLoggedIn } from '@/lib/authCheck';

export function generateMetadata(): Metadata {
    return {
        title: 'Register',
        description: 'Hyreyou Registration'
    };
}

const RegisterPage = async () => {
    await isLoggedIn();

    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    );
};

export default RegisterPage;
