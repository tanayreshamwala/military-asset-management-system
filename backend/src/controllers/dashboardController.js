import { dashboardService } from "../services/dashboardService.js";
import { asyncHandler } from "../utils/errors.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const { baseId } = req.params;
  const metrics = await dashboardService.getDashboardMetrics(baseId);

  res.status(200).json({
    success: true,
    metrics,
  });
});
