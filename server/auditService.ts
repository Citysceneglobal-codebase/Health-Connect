import { storage } from "./storage";

interface AuditLogEntry {
  id?: number;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AuditQuery {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: AuditLogEntry['severity'];
  limit?: number;
  offset?: number;
}

interface AuditStats {
  totalLogs: number;
  logsBySeverity: Record<string, number>;
  logsByAction: Record<string, number>;
  logsByResource: Record<string, number>;
  recentActivity: AuditLogEntry[];
}

export class AuditService {
  // Log an admin action
  async logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date(),
      };

      // In a real implementation, this would save to a dedicated audit table
      // For now, we'll log to console and could extend storage to include audit logs
      console.log('AUDIT LOG:', {
        timestamp: auditEntry.timestamp.toISOString(),
        userId: auditEntry.userId,
        action: auditEntry.action,
        resource: auditEntry.resource,
        resourceId: auditEntry.resourceId,
        severity: auditEntry.severity,
        details: auditEntry.details,
        ipAddress: auditEntry.ipAddress,
        userAgent: auditEntry.userAgent,
      });

      // TODO: Save to database when audit table is implemented
      // await storage.createAuditLog(auditEntry);
    } catch (error) {
      console.error('Error logging audit action:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  // Query audit logs
  async queryLogs(query: AuditQuery): Promise<AuditLogEntry[]> {
    try {
      // In a real implementation, this would query the audit table
      // For now, return mock data
      const mockLogs: AuditLogEntry[] = [
        {
          id: 1,
          userId: 'admin-user-1',
          action: 'CREATE_DOCTOR',
          resource: 'doctors',
          resourceId: '123',
          details: { doctorName: 'Dr. John Smith', department: 'Cardiology' },
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          severity: 'medium',
        },
        {
          id: 2,
          userId: 'admin-user-1',
          action: 'UPDATE_MEDICINE',
          resource: 'medicines',
          resourceId: '456',
          details: { medicineName: 'Aspirin', change: 'Updated dosage' },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          severity: 'low',
        },
        {
          id: 3,
          userId: 'admin-user-2',
          action: 'DELETE_USER',
          resource: 'users',
          resourceId: '789',
          details: { reason: 'Account violation' },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          severity: 'high',
        },
      ];

      let filteredLogs = mockLogs;

      if (query.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === query.userId);
      }
      if (query.action) {
        filteredLogs = filteredLogs.filter(log => log.action === query.action);
      }
      if (query.resource) {
        filteredLogs = filteredLogs.filter(log => log.resource === query.resource);
      }
      if (query.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= query.startDate!);
      }
      if (query.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= query.endDate!);
      }
      if (query.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === query.severity);
      }

      // Apply pagination
      const offset = query.offset || 0;
      const limit = query.limit || 50;
      filteredLogs = filteredLogs.slice(offset, offset + limit);

      return filteredLogs;
    } catch (error) {
      console.error('Error querying audit logs:', error);
      return [];
    }
  }

  // Get audit statistics
  async getAuditStats(timeRange?: { start: Date; end: Date }): Promise<AuditStats> {
    try {
      const logs = await this.queryLogs({
        startDate: timeRange?.start,
        endDate: timeRange?.end,
        limit: 1000, // Get more logs for stats
      });

      const stats: AuditStats = {
        totalLogs: logs.length,
        logsBySeverity: {},
        logsByAction: {},
        logsByResource: {},
        recentActivity: logs.slice(0, 10),
      };

      logs.forEach(log => {
        // Count by severity
        stats.logsBySeverity[log.severity] = (stats.logsBySeverity[log.severity] || 0) + 1;

        // Count by action
        stats.logsByAction[log.action] = (stats.logsByAction[log.action] || 0) + 1;

        // Count by resource
        stats.logsByResource[log.resource] = (stats.logsByResource[log.resource] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting audit stats:', error);
      return {
        totalLogs: 0,
        logsBySeverity: {},
        logsByAction: {},
        logsByResource: {},
        recentActivity: [],
      };
    }
  }

  // Predefined audit actions
  static readonly ACTIONS = {
    // User management
    CREATE_USER: 'CREATE_USER',
    UPDATE_USER: 'UPDATE_USER',
    DELETE_USER: 'DELETE_USER',
    LOGIN_USER: 'LOGIN_USER',
    LOGOUT_USER: 'LOGOUT_USER',

    // Doctor management
    CREATE_DOCTOR: 'CREATE_DOCTOR',
    UPDATE_DOCTOR: 'UPDATE_DOCTOR',
    DELETE_DOCTOR: 'DELETE_DOCTOR',

    // Medicine management
    CREATE_MEDICINE: 'CREATE_MEDICINE',
    UPDATE_MEDICINE: 'UPDATE_MEDICINE',
    DELETE_MEDICINE: 'DELETE_MEDICINE',

    // Appointment management
    CREATE_APPOINTMENT: 'CREATE_APPOINTMENT',
    UPDATE_APPOINTMENT: 'UPDATE_APPOINTMENT',
    CANCEL_APPOINTMENT: 'CANCEL_APPOINTMENT',
    RESCHEDULE_APPOINTMENT: 'RESCHEDULE_APPOINTMENT',

    // Prescription management
    CREATE_PRESCRIPTION: 'CREATE_PRESCRIPTION',
    UPDATE_PRESCRIPTION: 'UPDATE_PRESCRIPTION',
    SIGN_PRESCRIPTION: 'SIGN_PRESCRIPTION',
    VERIFY_PRESCRIPTION: 'VERIFY_PRESCRIPTION',

    // Document management
    UPLOAD_DOCUMENT: 'UPLOAD_DOCUMENT',
    VIEW_DOCUMENT: 'VIEW_DOCUMENT',
    DELETE_DOCUMENT: 'DELETE_DOCUMENT',

    // Payment management
    PROCESS_PAYMENT: 'PROCESS_PAYMENT',
    REFUND_PAYMENT: 'REFUND_PAYMENT',

    // System actions
    SYSTEM_BACKUP: 'SYSTEM_BACKUP',
    SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
    CONFIGURATION_CHANGE: 'CONFIGURATION_CHANGE',

    // Security events
    FAILED_LOGIN: 'FAILED_LOGIN',
    PASSWORD_CHANGE: 'PASSWORD_CHANGE',
    PERMISSION_CHANGE: 'PERMISSION_CHANGE',
    SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  } as const;

  static readonly RESOURCES = {
    USERS: 'users',
    DOCTORS: 'doctors',
    MEDICINES: 'medicines',
    APPOINTMENTS: 'appointments',
    PRESCRIPTIONS: 'prescriptions',
    DOCUMENTS: 'documents',
    PAYMENTS: 'payments',
    SYSTEM: 'system',
  } as const;

  // Helper methods for common audit scenarios
  async logUserAction(userId: string, action: string, details?: any, severity: AuditLogEntry['severity'] = 'low'): Promise<void> {
    await this.logAction({
      userId,
      action,
      resource: 'users',
      resourceId: userId,
      details,
      severity,
    });
  }

  async logDoctorAction(adminId: string, action: string, doctorId: string, details?: any): Promise<void> {
    await this.logAction({
      userId: adminId,
      action,
      resource: 'doctors',
      resourceId: doctorId,
      details,
      severity: 'medium',
    });
  }

  async logMedicineAction(adminId: string, action: string, medicineId: string, details?: any): Promise<void> {
    await this.logAction({
      userId: adminId,
      action,
      resource: 'medicines',
      resourceId: medicineId,
      details,
      severity: 'low',
    });
  }

  async logAppointmentAction(userId: string, action: string, appointmentId: string, details?: any): Promise<void> {
    await this.logAction({
      userId,
      action,
      resource: 'appointments',
      resourceId: appointmentId,
      details,
      severity: 'low',
    });
  }

  async logSecurityEvent(userId: string, action: string, details?: any, severity: AuditLogEntry['severity'] = 'high'): Promise<void> {
    await this.logAction({
      userId,
      action,
      resource: 'system',
      details,
      severity,
    });
  }

  // Export audit logs (for compliance reporting)
  async exportAuditLogs(query: AuditQuery, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const logs = await this.queryLogs({ ...query, limit: 10000 }); // Large limit for export

      if (format === 'csv') {
        const headers = ['Timestamp', 'User ID', 'Action', 'Resource', 'Resource ID', 'Severity', 'Details', 'IP Address'];
        const csvRows = logs.map(log => [
          log.timestamp.toISOString(),
          log.userId,
          log.action,
          log.resource,
          log.resourceId || '',
          log.severity,
          JSON.stringify(log.details || {}),
          log.ipAddress || '',
        ]);

        return [headers, ...csvRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      } else {
        return JSON.stringify(logs, null, 2);
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw new Error('Failed to export audit logs');
    }
  }

  // Clean up old audit logs (data retention policy)
  async cleanupOldLogs(daysToKeep: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // In a real implementation, this would delete old logs from the database
      console.log(`Audit cleanup: Would delete logs older than ${cutoffDate.toISOString()}`);

      // Return mock count of deleted logs
      return Math.floor(Math.random() * 100);
    } catch (error) {
      console.error('Error cleaning up old audit logs:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const auditService = new AuditService();