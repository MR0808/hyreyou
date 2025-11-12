// Audit System Types
// Centralized audit event definitions for HyreYou

export const AUDIT_ACTIONS = {
    // User Actions
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    USER_LOGIN: 'user.login',
    USER_LOGOUT: 'user.logout',
    USER_PASSWORD_RESET: 'user.password_reset',
    USER_PASSWORD_RESET_REQUESTED: 'user.password_reset_requested',

    // Candidate Profile Actions
    PROFILE_CREATED: 'profile.created',
    PROFILE_UPDATED: 'profile.updated',
    PROFILE_VIEWED: 'profile.viewed',
    PROFILE_VISIBILITY_CHANGED: 'profile.visibility_changed',

    // Organization Actions
    ORG_CREATED: 'organization.created',
    ORG_UPDATED: 'organization.updated',
    ORG_DELETED: 'organization.deleted',
    ORG_MEMBER_ADDED: 'organization.member_added',
    ORG_MEMBER_REMOVED: 'organization.member_removed',
    ORG_MEMBER_ROLE_CHANGED: 'organization.member_role_changed',

    // Job Actions
    JOB_CREATED: 'job.created',
    JOB_UPDATED: 'job.updated',
    JOB_PUBLISHED: 'job.published',
    JOB_CLOSED: 'job.closed',
    JOB_DELETED: 'job.deleted',
    JOB_VIEWED: 'job.viewed',

    // Application Actions
    APPLICATION_SUBMITTED: 'application.submitted',
    APPLICATION_VIEWED: 'application.viewed',
    APPLICATION_STATUS_CHANGED: 'application.status_changed',
    APPLICATION_WITHDRAWN: 'application.withdrawn',

    // Verification Actions
    VERIFICATION_REQUESTED: 'verification.requested',
    VERIFICATION_APPROVED: 'verification.approved',
    VERIFICATION_REJECTED: 'verification.rejected',

    // Billing Actions
    BILLING_PLAN_CHANGED: 'billing.plan_changed',
    BILLING_PAYMENT_SUCCESS: 'billing.payment_success',
    BILLING_PAYMENT_FAILED: 'billing.payment_failed',

    // System Actions
    FEATURE_FLAG_TOGGLED: 'system.feature_flag_toggled',
    ADMIN_ACTION: 'system.admin_action'
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export interface AuditLogEntry {
    userId?: string;
    action: AuditAction;
    entity: string;
    entityId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

export interface AuditLogQuery {
    userId?: string;
    action?: AuditAction | AuditAction[];
    entity?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}
