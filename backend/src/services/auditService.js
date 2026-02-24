import AuditLog from "../models/AuditLog.js";
import { getClientIp } from "../utils/errors.js";

export const auditService = {
  async logAction({
    userId,
    action,
    entityType,
    entityId,
    previousState,
    newState,
    changes,
    ipAddress,
  }) {
    try {
      const auditLog = new AuditLog({
        userId,
        action,
        entityType,
        entityId,
        previousState,
        newState,
        changes,
        ipAddress: ipAddress || "0.0.0.0",
        timestamp: new Date(),
      });

      await auditLog.save();
      console.log(`Audit log: ${action} on ${entityType} ${entityId}`);
    } catch (error) {
      console.error("Failed to log audit action:", error.message);
      // Don't throw - audit logging failure shouldn't break the main operation
    }
  },

  async getAuditLogs(filters = {}) {
    try {
      const query = {};
      if (filters.userId) query.userId = filters.userId;
      if (filters.entityType) query.entityType = filters.entityType;
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = filters.startDate;
        if (filters.endDate) query.timestamp.$lte = filters.endDate;
      }

      return await AuditLog.find(query)
        .populate("userId", "name email")
        .sort({ timestamp: -1 })
        .limit(1000);
    } catch (error) {
      console.error("Error fetching audit logs:", error.message);
      throw error;
    }
  },
};
