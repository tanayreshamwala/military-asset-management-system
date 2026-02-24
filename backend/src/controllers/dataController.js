import {
  userService,
  baseService,
  assetService,
} from "../services/dataService.js";
import { asyncHandler, getClientIp } from "../utils/errors.js";

// User Controllers
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const { users, pagination } = await userService.getAllUsers(
    req.user.role,
    parseInt(page),
    parseInt(limit),
  );

  res.status(200).json({
    success: true,
    users,
    pagination,
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const ipAddress = getClientIp(req);
  const user = await userService.createUser(
    req.body,
    req.user.userId,
    ipAddress,
  );

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = getClientIp(req);
  const user = await userService.updateUser(
    id,
    req.body,
    req.user.userId,
    ipAddress,
  );

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = getClientIp(req);
  await userService.deleteUser(id, req.user.userId, ipAddress);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// Base Controllers
export const getBases = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const { bases, pagination } = await baseService.getAllBases(
    parseInt(page),
    parseInt(limit),
  );

  res.status(200).json({
    success: true,
    bases,
    pagination,
  });
});

export const createBase = asyncHandler(async (req, res) => {
  const ipAddress = getClientIp(req);
  const base = await baseService.createBase(
    req.body,
    req.user.userId,
    ipAddress,
  );

  res.status(201).json({
    success: true,
    message: "Base created successfully",
    base,
  });
});

export const updateBase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = getClientIp(req);
  const base = await baseService.updateBase(
    id,
    req.body,
    req.user.userId,
    ipAddress,
  );

  res.status(200).json({
    success: true,
    message: "Base updated successfully",
    base,
  });
});

export const deleteBase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = getClientIp(req);
  await baseService.deleteBase(id, req.user.userId, ipAddress);

  res.status(200).json({
    success: true,
    message: "Base deleted successfully",
  });
});

// Asset Controllers
export const getAssets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const { assets, pagination } = await assetService.getAllAssets(
    parseInt(page),
    parseInt(limit),
  );

  res.status(200).json({
    success: true,
    assets,
    pagination,
  });
});

export const createAsset = asyncHandler(async (req, res) => {
  const ipAddress = getClientIp(req);
  const asset = await assetService.createAsset(
    req.body,
    req.user.userId,
    ipAddress,
  );

  res.status(201).json({
    success: true,
    message: "Asset created successfully",
    asset,
  });
});

export const updateAsset = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = getClientIp(req);
  const asset = await assetService.updateAsset(
    id,
    req.body,
    req.user.userId,
    ipAddress,
  );

  res.status(200).json({
    success: true,
    message: "Asset updated successfully",
    asset,
  });
});

export const deleteAsset = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = getClientIp(req);
  await assetService.deleteAsset(id, req.user.userId, ipAddress);

  res.status(200).json({
    success: true,
    message: "Asset deleted successfully",
  });
});
