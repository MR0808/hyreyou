'use server';

import { Resend } from 'resend';

import WelcomeEmailTemplate from '@/emails/welcome-email';
import ResetPasswordEmailTemplate from '@/emails/reset-password';
import VerificationEmail from '@/emails/verification-email';
import { SendVerificationEmailProps } from '@/types/mail';

const resend = new Resend(process.env.RESEND_API_KEY);

const fromPerson = `${process.env.NEXT_PUBLIC_APP_NAME as string} <${process.env.NEXT_PUBLIC_APP_EMAIL as string}>`;
const fromHyreyou = `Hyreyou Support <${process.env.NEXT_PUBLIC_APP_EMAIL_SUPPORT as string}>`;

export const sendVerificationEmail = async ({
    to,
    magicLink,
    otp
}: SendVerificationEmailProps) => {
    try {
        const { data, error } = await resend.emails.send({
            from: fromHyreyou,
            to,
            subject: 'Verify your HyreYou email address',
            react: VerificationEmail({ magicLink, otp })
        });

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const sendWelcomeEmail = async ({
    email,
    name
}: {
    email: string;
    name: string;
}) => {
    await resend.emails.send({
        from: fromPerson,
        to: email,
        subject: `🎉 Welcome to Hyreyou, ${name}!`,
        react: WelcomeEmailTemplate({ name })
    });
};

export const sendResetEmail = async ({
    email,
    link,
    name
}: {
    email: string;
    link: string;
    name: string;
}) => {
    await resend.emails.send({
        from: fromHyreyou,
        to: email,
        subject: 'Hyreyou - Reset password',
        react: ResetPasswordEmailTemplate({ name, link })
    });
};
