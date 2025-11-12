'use server';

import { Resend } from 'resend';

import EmailOTPEmailTemplate from '@/emails/email-otp';
import WelcomeEmailTemplate from '@/emails/welcome-email';
import ResetPasswordEmailTemplate from '@/emails/reset-password';

const resend = new Resend(process.env.RESEND_API_KEY);

const fromPerson = `${process.env.NEXT_PUBLIC_APP_NAME as string} <${process.env.NEXT_PUBLIC_APP_EMAIL as string}>`;
const fromHyreyou = `Nudgely Support <${process.env.NEXT_PUBLIC_APP_EMAIL_SUPPORT as string}>`;

export const sendVerificationEmail = async ({
    email,
    otp,
    name
}: {
    email: string;
    otp: string;
    name: string;
}) => {
    const sent = await resend.emails.send({
        from: fromHyreyou,
        to: email,
        subject: 'Hyreyou - Confirm your email',
        react: EmailOTPEmailTemplate({ name, otp })
    });

    return sent;
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
