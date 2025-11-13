// Simple in-memory rate limiter
// In production, use Redis or similar
interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_EMAIL = 3;
const MAX_ATTEMPTS_PER_IP = 10;

export function checkRateLimit(key: string, maxAttempts: number): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
        rateLimitStore.set(key, {
            count: 1,
            resetAt: now + RATE_LIMIT_WINDOW
        });
        return true;
    }

    if (entry.count >= maxAttempts) {
        return false;
    }

    entry.count++;
    return true;
}

export function canSendVerification(
    email: string,
    ipAddress?: string
): { allowed: boolean; reason?: string } {
    const emailKey = `email:${email}`;

    if (!checkRateLimit(emailKey, MAX_ATTEMPTS_PER_EMAIL)) {
        return {
            allowed: false,
            reason: 'Too many verification requests for this email. Please try again in 15 minutes.'
        };
    }

    if (ipAddress) {
        const ipKey = `ip:${ipAddress}`;
        if (!checkRateLimit(ipKey, MAX_ATTEMPTS_PER_IP)) {
            return {
                allowed: false,
                reason: 'Too many verification requests from this IP address. Please try again in 15 minutes.'
            };
        }
    }

    return { allowed: true };
}
