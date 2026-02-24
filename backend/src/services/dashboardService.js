import Inventory from "../models/Inventory.js";
import Purchase from "../models/Purchase.js";
import Transfer from "../models/Transfer.js";
import Assignment from "../models/Assignment.js";
import Expenditure from "../models/Expenditure.js";
import mongoose from "mongoose";
// import { AppError } from "../utils/errors.js";

export const dashboardService = {
  async getDashboardMetrics(baseId) {
    try {
      const objectId = new mongoose.Types.ObjectId(baseId);
      const pipeline = [
        { $match: { baseId: objectId } },
        {
          $lookup: {
            from: "assets",
            localField: "assetId",
            foreignField: "_id",
            as: "asset",
          },
        },
        { $unwind: { path: "$asset", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$assetId",
            assetName: { $first: "$asset.name" },
            assetType: { $first: "$asset.type" },
            openingBalance: { $first: "$openingBalance" },
            currentQuantity: { $first: "$currentQuantity" },
          },
        },
      ];

      const inventoryData = await Inventory.aggregate(pipeline);

      // Get aggregated metrics
      const purchases = await Purchase.countDocuments({ baseId: objectId });
      const transfers = await Transfer.countDocuments({
        $or: [{ fromBaseId: objectId }, { toBaseId: objectId }],
      });
      const assignments = await Assignment.countDocuments({ baseId: objectId });
      const expenditures = await Expenditure.countDocuments({
        baseId: objectId,
      });

      // Calculate totals
      const totals = await Inventory.aggregate([
        { $match: { baseId: objectId } },
        {
          $group: {
            _id: null,
            totalOpening: { $sum: "$openingBalance" },
            totalCurrent: { $sum: "$currentQuantity" },
          },
        },
      ]);

      const lowStockItems = await Inventory.find({
        baseId: objectId,
        currentQuantity: { $lt: 10 },
      })
        .populate("assetId", "name type")
        .limit(5);

      return {
        totals:
          totals.length > 0 ? totals[0] : { totalOpening: 0, totalCurrent: 0 },
        inventory: inventoryData,
        transactionCounts: {
          purchases,
          transfers,
          assignments,
          expenditures,
        },
        lowStockAlert: lowStockItems,
      };
    } catch (error) {
      console.error("Error generating dashboard metrics:", error.message);
      throw error;
    }
  },
};
