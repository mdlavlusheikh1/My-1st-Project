/**
 * Audit Logger
 * Tracks all sensitive operations for security and compliance
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export enum AuditAction {
  // User actions
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ROLE_CHANGED = 'user_role_changed',
  USER_PASSWORD_CHANGED = 'user_password_changed',
  USER_PASSWORD_RESET = 'user_password_reset',
  
  // School actions
  SCHOOL_CREATED = 'school_created',
  SCHOOL_UPDATED = 'school_updated',
  SCHOOL_DELETED = 'school_deleted',
  
  // Student actions
  STUDENT_CREATED = 'student_created',
  STUDENT_UPDATED = 'student_updated',
  STUDENT_DELETED = 'student_deleted',
  STUDENT_QR_GENERATED = 'student_qr_generated',
  
  // Attendance actions
  ATTENDANCE_MARKED = 'attendance_marked',
  ATTENDANCE_UPDATED = 'attendance_updated',
  ATTENDANCE_DELETED = 'attendance_deleted',
  ATTENDANCE_SESSION_STARTED = 'attendance_session_started',
  ATTENDANCE_SESSION_ENDED = 'attendance_session_ended',
  
  // Class actions
  CLASS_CREATED = 'class_created',
  CLASS_UPDATED = 'class_updated',
  CLASS_DELETED = 'class_deleted',
  
  // Security events
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
  FAILED_LOGIN_ATTEMPT = 'failed_login_attempt',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  
  // Data access
  SENSITIVE_DATA_ACCESSED = 'sensitive_data_accessed',
  BULK_EXPORT = 'bulk_export',
  REPORT_GENERATED = 'report_generated',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AuditLogEntry {
  action: AuditAction;
  severity: AuditSeverity;
  userId: string;
  userEmail?: string;
  userRole?: string;
  schoolId?: string;
  targetId?: string; // ID of the affected resource
  targetType?: string; // Type of resource (user, student, class, etc.)
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: any; // Firestore serverTimestamp
  success: boolean;
  errorMessage?: string;
}

/**
 * Logs an audit event to Firestore
 */
export async function logAuditEvent(
  action: AuditAction,
  userId: string,
  options: {
    severity?: AuditSeverity;
    userEmail?: string;
    userRole?: string;
    schoolId?: string;
    targetId?: string;
    targetType?: string;
    details?: Record<string, any>;
    success?: boolean;
    errorMessage?: string;
  } = {}
): Promise<void> {
  try {
    const auditEntry: AuditLogEntry = {
      action,
      severity: options.severity || AuditSeverity.INFO,
      userId,
      userEmail: options.userEmail,
      userRole: options.userRole,
      schoolId: options.schoolId,
      targetId: options.targetId,
      targetType: options.targetType,
      details: options.details,
      ipAddress: await getClientIP(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: serverTimestamp(),
      success: options.success !== false,
      errorMessage: options.errorMessage,
    };

    // Log to Firestore
    await addDoc(collection(db, 'systemLogs'), auditEntry);

    // Also log critical events to console for immediate visibility
    if (options.severity === AuditSeverity.CRITICAL || options.severity === AuditSeverity.ERROR) {
      console.error('[AUDIT LOG]', action, auditEntry);
    }
  } catch (error) {
    // Fail silently to not disrupt user operations
    // But log to console for debugging
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Gets client IP address (best effort)
 */
async function getClientIP(): Promise<string | undefined> {
  try {
    if (typeof window === 'undefined') return undefined;
    
    // In production, you might use a service or server-side endpoint
    // For now, return undefined as client-side can't reliably get IP
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Helper functions for common audit scenarios
 */

export async function logUserLogin(userId: string, userEmail: string, userRole: string, success: boolean = true) {
  await logAuditEvent(AuditAction.USER_LOGIN, userId, {
    severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
    userEmail,
    userRole,
    success,
  });
}

export async function logUserLogout(userId: string, userEmail: string) {
  await logAuditEvent(AuditAction.USER_LOGOUT, userId, {
    severity: AuditSeverity.INFO,
    userEmail,
  });
}

export async function logFailedLoginAttempt(email: string, reason: string) {
  await logAuditEvent(AuditAction.FAILED_LOGIN_ATTEMPT, 'anonymous', {
    severity: AuditSeverity.WARNING,
    userEmail: email,
    success: false,
    errorMessage: reason,
  });
}

export async function logUserCreated(
  creatorId: string,
  creatorRole: string,
  newUserId: string,
  newUserEmail: string,
  newUserRole: string,
  schoolId?: string
) {
  await logAuditEvent(AuditAction.USER_CREATED, creatorId, {
    severity: AuditSeverity.INFO,
    userRole: creatorRole,
    schoolId,
    targetId: newUserId,
    targetType: 'user',
    details: {
      newUserEmail,
      newUserRole,
    },
  });
}

export async function logRoleChange(
  adminId: string,
  adminRole: string,
  targetUserId: string,
  oldRole: string,
  newRole: string,
  schoolId?: string
) {
  await logAuditEvent(AuditAction.USER_ROLE_CHANGED, adminId, {
    severity: AuditSeverity.WARNING,
    userRole: adminRole,
    schoolId,
    targetId: targetUserId,
    targetType: 'user',
    details: {
      oldRole,
      newRole,
    },
  });
}

export async function logUnauthorizedAccess(
  userId: string,
  attemptedResource: string,
  userRole?: string
) {
  await logAuditEvent(AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT, userId, {
    severity: AuditSeverity.ERROR,
    userRole,
    success: false,
    details: {
      attemptedResource,
    },
  });
}

export async function logSuspiciousActivity(
  userId: string,
  activityType: string,
  details: Record<string, any>
) {
  await logAuditEvent(AuditAction.SUSPICIOUS_ACTIVITY, userId, {
    severity: AuditSeverity.CRITICAL,
    success: false,
    details: {
      activityType,
      ...details,
    },
  });
}

export async function logAttendanceMarked(
  teacherId: string,
  teacherRole: string,
  studentId: string,
  classId: string,
  schoolId: string,
  status: string
) {
  await logAuditEvent(AuditAction.ATTENDANCE_MARKED, teacherId, {
    severity: AuditSeverity.INFO,
    userRole: teacherRole,
    schoolId,
    targetId: studentId,
    targetType: 'student',
    details: {
      classId,
      status,
    },
  });
}

export async function logDataExport(
  userId: string,
  userRole: string,
  exportType: string,
  recordCount: number,
  schoolId?: string
) {
  await logAuditEvent(AuditAction.BULK_EXPORT, userId, {
    severity: AuditSeverity.WARNING,
    userRole,
    schoolId,
    details: {
      exportType,
      recordCount,
    },
  });
}

export async function logRateLimitExceeded(
  userId: string,
  action: string,
  attemptCount: number
) {
  await logAuditEvent(AuditAction.RATE_LIMIT_EXCEEDED, userId, {
    severity: AuditSeverity.WARNING,
    success: false,
    details: {
      action,
      attemptCount,
    },
  });
}

/**
 * Query audit logs (for super admin dashboard)
 */
export async function getAuditLogs(
  filters: {
    userId?: string;
    schoolId?: string;
    action?: AuditAction;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
) {
  // This would be implemented with Firestore queries
  // For now, returning a placeholder
  // In production, add proper querying with indexes
  return [];
}
