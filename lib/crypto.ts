import crypto from 'crypto';

const SECRET =
    process.env.EMAIL_VERIFICATION_SECRET ||
    'your-secret-key-change-in-production';

export interface SignedTokenData {
    userId: string;
    email: string;
    iat: number; // issued at timestamp
}

export function createSignedToken(data: SignedTokenData): string {
    const payload = JSON.stringify(data);
    const signature = crypto
        .createHmac('sha256', SECRET)
        .update(payload)
        .digest('hex');

    return `${Buffer.from(payload).toString('base64')}.${signature}`;
}

export function verifySignedToken(token: string): SignedTokenData | null {
    try {
        const [payloadBase64, signature] = token.split('.');
        if (!payloadBase64 || !signature) return null;

        const payload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const expectedSignature = crypto
            .createHmac('sha256', SECRET)
            .update(payload)
            .digest('hex');

        // Constant-time comparison
        if (
            !crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            )
        ) {
            return null;
        }

        const data: SignedTokenData = JSON.parse(payload);

        // Check expiration (10 minutes)
        const now = Math.floor(Date.now() / 1000);
        if (now - data.iat > 600) {
            // 10 minutes in seconds
            return null;
        }

        return data;
    } catch {
        return null;
    }
}

export function generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
}

export function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
}
