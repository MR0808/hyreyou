import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { Manrope, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const manrope = Manrope({
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap'
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap'
});

export const metadata: Metadata = {
    title: {
        default: 'HyreYou - Creating Seamless Connections',
        template: '%s | HyreYou'
    },
    description:
        'Create verified digital résumés and connect with opportunities. One profile, unlimited possibilities.',
    generator: 'v0.app',
    applicationName: 'HyreYou',
    keywords: [
        'resume',
        'career',
        'jobs',
        'recruitment',
        'hiring',
        'verified profiles'
    ],
    authors: [{ name: 'HyreYou' }],
    creator: 'HyreYou',
    publisher: 'HyreYou',
    icons: {
        icon: [
            {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)'
            },
            {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)'
            },
            {
                url: '/icon.svg',
                type: 'image/svg+xml'
            }
        ],
        apple: '/apple-icon.png'
    }
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#5271A0' }, // Slate blue
        { media: '(prefers-color-scheme: dark)', color: '#7591C4' } // Lighter slate blue
    ],
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${manrope.variable} ${inter.variable} font-sans antialiased`}
            >
                {children}
                <Analytics />
            </body>
        </html>
    );
}
