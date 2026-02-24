import { inventoryService } from "../services/inventoryService.js";
import { asyncHandler, getClientIp } from "../utils/errors.js";
import Purchase from "../models/Purchase.js";
import Transfer from "../models/Transfer.js";
import Assignment from "../models/Assignment.js";
import Expenditure from "../models/Expenditure.js";

export const getInventory = asyncHandler(async (req, res) => {
  const { baseId } = req.params;

  const inventory = await inventoryService.getInventory(
    baseId,
    req.user.userId,
    req.user.role,
  );

  res.status(200).json({
    success: true,
    inventory,
  });
});

export const setOpeningBalance = asyncHandler(async (req, res) => {
  const { baseId, assetId, openingBalance } = req.body;
  const ipAddress = getClientIp(req);

  const inventory = await inventoryService.setOpeningBalance(
    { baseId, assetId, openingBalance },
    req.user.userId,
    ipAddress,
  );

  res.status(200).json({
    success: true,
    message: "Opening balance set successfully",
    inventory,
  });
});

export const recordPurchase = asyncHandler(async (req, res) => {
  const { baseId, assetId, quantity } = req.body;
  const ipAddress = getClientIp(req);

  const purchase = await inventoryService.recordPurchase(
    { baseId, assetId, quantity },
    req.user.userId,
    ipAddress,
  );

  res.status(201).json({
    success: true,
    message: "Purchase recorded successfully",
    purchase,
  });
});

export const getPurchases = asyncHandler(async (req, res) => {
  const { baseId, page = 1, limit = 10 } = req.query;

  // Match query based on admin status
  const query =
    baseId && req.user.role !== "admin" ? { baseId } : baseId ? { baseId } : {};

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const purchases = await Purchase.find(query)
    .populate("assetId", "name type serialNumber")
    .populate("baseId", "name location")
    .populate("createdBy", "name email")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Purchase.countDocuments(query);

  res.status(200).json({
    success: true,
    purchases,
    pagination: { total, page: parseInt(page), limit: parseInt(limit) },
  });
});

export const recordTransfer = asyncHandler(async (req, res) => {
  const { fromBaseId, toBaseId, assetId, quantity } = req.body;
  const ipAddress = getClientIp(req);

  const transfer = await inventoryService.recordTransfer(
    { fromBaseId, toBaseId, assetId, quantity },
    req.user.userId,
    ipAddress,
  );

  res.status(201).json({
    success: true,
    message: "Transfer recorded successfully",
    transfer,
  });
});

export const getTransfers = asyncHandler(async (req, res) => {
  const { baseId, page = 1, limit = 10 } = req.query;

  const query =
    baseId && req.user.role !== "admin"
      ? { $or: [{ fromBaseId: baseId }, { toBaseId: baseId }] }
      : baseId
        ? { $or: [{ fromBaseId: baseId }, { toBaseId: baseId }] }
        : {};

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const transfers = await Transfer.find(query)
    .populate("assetId", "name type")
    .populate("fromBaseId", "name")
    .populate("toBaseId", "name")
    .populate("createdBy", "name email")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Transfer.countDocuments(query);

  res.status(200).json({
    success: true,
    transfers,
    pagination: { total, page: parseInt(page), limit: parseInt(limit) },
  });
});

export const assignAsset = asyncHandler(async (req, res) => {
  const { baseId, assetId, personnelName, personnelId, quantity } = req.body;
  const ipAddress = getClientIp(req);

  const assignment = await inventoryService.assignAsset(
    { baseId, assetId, personnelName, personnelId, quantity },
    req.user.userId,
    ipAddress,
  );

  res.status(201).json({
    success: true,
    message: "Asset assigned successfully",
    assignment,
  });
});

export const getAssignments = asyncHandler(async (req, res) => {
  const { baseId, page = 1, limit = 10 } = req.query;

  const query =
    baseId && req.user.role !== "admin" ? { baseId } : baseId ? { baseId } : {};

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const assignments = await Assignment.find(query)
    .populate("assetId", "name type")
    .populate("baseId", "name")
    .populate("assignedBy", "name email")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Assignment.countDocuments(query);

  res.status(200).json({
    success: true,
    assignments,
    pagination: { total, page: parseInt(page), limit: parseInt(limit) },
  });
});

export const recordExpenditure = asyncHandler(async (req, res) => {
  const { baseId, assetId, quantity, reason } = req.body;
  const ipAddress = getClientIp(req);

  const expenditure = await inventoryService.recordExpenditure(
    { baseId, assetId, quantity, reason },
    req.user.userId,
    ipAddress,
  );

  res.status(201).json({
    success: true,
    message: "Expenditure recorded successfully",
    expenditure,
  });
});

export const getExpenditures = asyncHandler(async (req, res) => {
  const { baseId, page = 1, limit = 10 } = req.query;

  const query =
    baseId && req.user.role !== "admin" ? { baseId } : baseId ? { baseId } : {};

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const expenditures = await Expenditure.find(query)
    .populate("assetId", "name type")
    .populate("baseId", "name")
    .populate("recordedBy", "name email")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Expenditure.countDocuments(query);

  res.status(200).json({
    success: true,
    expenditures,
    pagination: { total, page: parseInt(page), limit: parseInt(limit) },
  });
});
