// Audit Logger Utility
// Core audit logging functionality with Prisma

import { PrismaClient } from '@/generated/prisma';
import type { AuditLogEntry } from '@/types/audit';

// Singleton Prisma client
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Log an audit event to the database
 * @param entry - Audit log entry data
 * @returns The created audit log record
 */
export async function logAudit(entry: AuditLogEntry) {
    try {
        const auditLog = await prisma.auditLog.create({
            data: {
                userId: entry.userId,
                action: entry.action,
                entity: entry.entity,
                entityId: entry.entityId,
                metadata: entry.metadata || {},
                ipAddress: entry.ipAddress,
                userAgent: entry.userAgent
            }
        });

        return auditLog;
    } catch (error) {
        return null;
    }
}

export const createAuditLog = logAudit;

/**
 * Batch log multiple audit events
 * @param entries - Array of audit log entries
 */
export async function logAuditBatch(entries: AuditLogEntry[]) {
    try {
        const auditLogs = await prisma.auditLog.createMany({
            data: entries.map((entry) => ({
                userId: entry.userId,
                action: entry.action,
                entity: entry.entity,
                entityId: entry.entityId,
                metadata: entry.metadata || {},
                ipAddress: entry.ipAddress,
                userAgent: entry.userAgent
            }))
        });

        return auditLogs;
    } catch (error) {
        console.error('[v0] Failed to create batch audit logs:', error);
        return null;
    }
}
