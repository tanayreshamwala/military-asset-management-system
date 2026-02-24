import { auditService } from "../services/auditService.js";
import { asyncHandler } from "../utils/errors.js";

export const getAuditLogs = asyncHandler(async (req, res) => {
  const {
    userId,
    entityType,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  } = req.query;

  const logs = await auditService.getAuditLogs({
    userId,
    entityType,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  const start = (parseInt(page) - 1) * parseInt(limit);
  const end = start + parseInt(limit);
  const paginatedLogs = logs.slice(start, end);

  res.status(200).json({
    success: true,
    logs: paginatedLogs,
    pagination: {
      total: logs.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(logs.length / parseInt(limit)),
    },
  });
});
