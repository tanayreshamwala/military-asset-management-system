import User from "../models/User.js";
import Base from "../models/Base.js";
import Asset from "../models/Asset.js";
import { AppError } from "../utils/errors.js";
import { auditService } from "./auditService.js";

export const userService = {
  async getAllUsers(userRole, page = 1, limit = 10) {
    try {
      const query = {};
      const skip = (page - 1) * limit;

      const users = await User.find(query)
        .select("-password")
        .populate("baseId", "name location")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      return {
        users,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error("Error fetching users:", error.message);
      throw error;
    }
  },

  async createUser(userData, userId, ipAddress) {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new AppError("Email already exists", 400);
      }

      const user = new User(userData);
      await user.save();

      await auditService.logAction({
        userId,
        action: "CREATE_USER",
        entityType: "User",
        entityId: user._id,
        newState: { name: user.name, email: user.email, role: user.role },
        ipAddress,
      });

      console.log(`User created: ${user.email}`);
      return user.toObject({
        transform: (doc, ret) => {
          delete ret.password;
          return ret;
        },
      });
    } catch (error) {
      console.error("Error creating user:", error.message);
      throw error;
    }
  },

  async updateUser(userId, updateData, currentUserId, ipAddress) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      const previousState = user.toObject();
      Object.assign(user, updateData);
      await user.save();

      await auditService.logAction({
        userId: currentUserId,
        action: "UPDATE_USER",
        entityType: "User",
        entityId: user._id,
        previousState,
        newState: user.toObject(),
        changes: updateData,
        ipAddress,
      });

      console.log(`User updated: ${user.email}`);
      return user.toObject({
        transform: (doc, ret) => {
          delete ret.password;
          return ret;
        },
      });
    } catch (error) {
      console.error("Error updating user:", error.message);
      throw error;
    }
  },

  async deleteUser(userId, currentUserId, ipAddress) {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      await auditService.logAction({
        userId: currentUserId,
        action: "DELETE_USER",
        entityType: "User",
        entityId: userId,
        previousState: user.toObject(),
        ipAddress,
      });

      console.log(`User deleted: ${user.email}`);
      return user;
    } catch (error) {
      console.error("Error deleting user:", error.message);
      throw error;
    }
  },
};

export const baseService = {
  async getAllBases(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const bases = await Base.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Base.countDocuments();

      return {
        bases,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error("Error fetching bases:", error.message);
      throw error;
    }
  },

  async createBase(baseData, userId, ipAddress) {
    try {
      const base = new Base(baseData);
      await base.save();

      await auditService.logAction({
        userId,
        action: "CREATE_BASE",
        entityType: "Base",
        entityId: base._id,
        newState: base.toObject(),
        ipAddress,
      });

      console.log(`Base created: ${base.name}`);
      return base;
    } catch (error) {
      console.error("Error creating base:", error.message);
      throw error;
    }
  },

  async updateBase(baseId, updateData, userId, ipAddress) {
    try {
      const base = await Base.findById(baseId);
      if (!base) {
        throw new AppError("Base not found", 404);
      }

      const previousState = base.toObject();
      Object.assign(base, updateData);
      await base.save();

      await auditService.logAction({
        userId,
        action: "UPDATE_BASE",
        entityType: "Base",
        entityId: base._id,
        previousState,
        newState: base.toObject(),
        changes: updateData,
        ipAddress,
      });

      console.log(`Base updated: ${base.name}`);
      return base;
    } catch (error) {
      console.error("Error updating base:", error.message);
      throw error;
    }
  },

  async deleteBase(baseId, userId, ipAddress) {
    try {
      const base = await Base.findByIdAndDelete(baseId);
      if (!base) {
        throw new AppError("Base not found", 404);
      }

      await auditService.logAction({
        userId,
        action: "DELETE_BASE",
        entityType: "Base",
        entityId: baseId,
        previousState: base.toObject(),
        ipAddress,
      });

      console.log(`Base deleted: ${base.name}`);
      return base;
    } catch (error) {
      console.error("Error deleting base:", error.message);
      throw error;
    }
  },
};

export const assetService = {
  async getAllAssets(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const assets = await Asset.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Asset.countDocuments();

      return {
        assets,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error("Error fetching assets:", error.message);
      throw error;
    }
  },

  async createAsset(assetData, userId, ipAddress) {
    try {
      const existingAsset = await Asset.findOne({
        serialNumber: assetData.serialNumber,
      });
      if (existingAsset) {
        throw new AppError("Serial number already exists", 400);
      }

      const asset = new Asset(assetData);
      await asset.save();

      await auditService.logAction({
        userId,
        action: "CREATE_ASSET",
        entityType: "Asset",
        entityId: asset._id,
        newState: asset.toObject(),
        ipAddress,
      });

      console.log(`Asset created: ${asset.name} (${asset.serialNumber})`);
      return asset;
    } catch (error) {
      console.error("Error creating asset:", error.message);
      throw error;
    }
  },

  async updateAsset(assetId, updateData, userId, ipAddress) {
    try {
      const asset = await Asset.findById(assetId);
      if (!asset) {
        throw new AppError("Asset not found", 404);
      }

      const previousState = asset.toObject();
      Object.assign(asset, updateData);
      await asset.save();

      await auditService.logAction({
        userId,
        action: "UPDATE_ASSET",
        entityType: "Asset",
        entityId: asset._id,
        previousState,
        newState: asset.toObject(),
        changes: updateData,
        ipAddress,
      });

      console.log(`Asset updated: ${asset.name}`);
      return asset;
    } catch (error) {
      console.error("Error updating asset:", error.message);
      throw error;
    }
  },

  async deleteAsset(assetId, userId, ipAddress) {
    try {
      const asset = await Asset.findByIdAndDelete(assetId);
      if (!asset) {
        throw new AppError("Asset not found", 404);
      }

      await auditService.logAction({
        userId,
        action: "DELETE_ASSET",
        entityType: "Asset",
        entityId: assetId,
        previousState: asset.toObject(),
        ipAddress,
      });

      console.log(`Asset deleted: ${asset.name}`);
      return asset;
    } catch (error) {
      console.error("Error deleting asset:", error.message);
      throw error;
    }
  },
};
