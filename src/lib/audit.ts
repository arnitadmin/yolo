/**
 * Admin Action Audit Logging
 * 
 * Logs all admin actions for security monitoring and compliance
 */

export type AdminAction = 
  | "user_role_change"
  | "application_create"
  | "application_update"
  | "application_delete"
  | "application_reorder"
  | "category_create"
  | "category_update"
  | "category_delete"
  | "admin_access"
  | "settings_change";

  
export interface AuditLogEntry {
  timestamp: string;
  userId: string;
  action: AdminAction;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an admin action
 * In production, this should write to a database or external logging service
 */
export async function logAdminAction(
  userId: string,
  action: AdminAction,
  details?: Record<string, any>,
  request?: Request
): Promise<void> {
  const logEntry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    details,
    ipAddress: request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || "unknown",
    userAgent: request?.headers.get("user-agent") || "unknown",
  };

  // Log to console (in production, send to logging service like Datadog, Sentry, etc.)
  console.log("[AUDIT]", JSON.stringify(logEntry));

  // TODO: In production, persist to database or send to logging service
  // Example:
  // await db.auditLog.create({ data: logEntry });
  // await sendToLoggingService(logEntry);
}

/**
 * Middleware helper to log admin actions in API routes
 */
export function createAuditLogger(userId: string, request: Request) {
  return (action: AdminAction, details?: Record<string, any>) => 
    logAdminAction(userId, action, details, request);
}

