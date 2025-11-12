// Audit Helper Functions
// Utilities for capturing request context

import { headers } from 'next/headers';
import type { AuditLogEntry, AuditAction } from '@/types/audit';
import { logAudit } from '@/lib/audit/logger';

/**
 * Get IP address from request headers
 */
export async function getClientIp(): Promise<string | undefined> {
    const headersList = await headers();

    // Try various header formats
    const ip =
        headersList.get('x-forwarded-for')?.split(',')[0] ||
        headersList.get('x-real-ip') ||
        headersList.get('cf-connecting-ip') ||
        undefined;

    return ip;
}

/**
 * Get user agent from request headers
 */
export async function getClientUserAgent(): Promise<string | undefined> {
    const headersList = await headers();
    return headersList.get('user-agent') || undefined;
}

/**
 * Create an audit log with automatic context capture
 * Convenience wrapper that automatically captures IP and user agent
 */
export async function createAuditLog(
    entry: Omit<AuditLogEntry, 'ipAddress' | 'userAgent'>
) {
    const ipAddress = await getClientIp();
    const userAgent = await getClientUserAgent();

    return logAudit({
        ...entry,
        ipAddress,
        userAgent
    });
}

/**
 * Audit decorator for server actions
 * Wraps a server action to automatically log execution
 */
export function withAudit<T extends (...args: any[]) => Promise<any>>(
    action: AuditAction,
    entity: string,
    fn: T
): T {
    return (async (...args: Parameters<T>) => {
        const result = await fn(...args);

        // Log after successful execution
        await createAuditLog({
            action,
            entity,
            metadata: {
                args: args.length > 0 ? args : undefined
            }
        });

        return result;
    }) as T;
}
