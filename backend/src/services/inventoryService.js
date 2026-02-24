import Inventory from "../models/Inventory.js";
import Purchase from "../models/Purchase.js";
import Transfer from "../models/Transfer.js";
import Assignment from "../models/Assignment.js";
import Expenditure from "../models/Expenditure.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { AppError } from "../utils/errors.js";
import { auditService } from "./auditService.js";

const TXN_NOT_SUPPORTED_MSG =
  "Transaction numbers are only allowed on a replica set member or mongos";

const isTransactionUnsupportedError = (error) =>
  error?.message?.includes(TXN_NOT_SUPPORTED_MSG);

const queryWithSession = (query, session) => (session ? query.session(session) : query);

const saveWithSession = (doc, session) =>
  session ? doc.save({ session }) : doc.save();

const runWithOptionalTransaction = async (operationName, operation) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction().catch(() => {});

    if (isTransactionUnsupportedError(error)) {
      console.warn(
        `${operationName}: MongoDB transactions unavailable; falling back to non-transaction mode`,
      );
      return operation(null);
    }

    throw error;
  } finally {
    session.endSession();
  }
};

export const inventoryService = {
  async setOpeningBalance(
    { baseId, assetId, openingBalance },
    userId,
    ipAddress,
  ) {
    try {
      const { inventory, previousState } = await runWithOptionalTransaction(
        "setOpeningBalance",
        async (session) => {
          let inventory = await queryWithSession(
            Inventory.findOne({ baseId, assetId }),
            session,
          );
          const previousState = inventory ? { ...inventory.toObject() } : null;

          if (!inventory) {
            inventory = new Inventory({
              baseId,
              assetId,
              openingBalance,
              currentQuantity: openingBalance,
            });
          } else {
            inventory.openingBalance = openingBalance;
            inventory.currentQuantity = openingBalance;
          }

          await saveWithSession(inventory, session);
          return { inventory, previousState };
        },
      );

      await auditService.logAction({
        userId,
        action: "SET_OPENING_BALANCE",
        entityType: "Inventory",
        entityId: inventory._id,
        previousState,
        newState: inventory.toObject(),
        changes: { openingBalance },
        ipAddress,
      });

      console.log(
        `Opening balance set: Base ${baseId}, Asset ${assetId}, Balance ${openingBalance}`,
      );
      return inventory;
    } catch (error) {
      console.error("Error setting opening balance:", error.message);
      throw error;
    }
  },

  async getInventory(baseId, userId, userRole) {
    try {
      if (userRole !== "admin") {
        const user = await User.findById(userId).select("baseId");
        if (!user?.baseId || user.baseId.toString() !== baseId) {
          throw new AppError("Cannot access other base inventory", 403);
        }
      }

      return await Inventory.find({ baseId })
        .populate("assetId", "name type serialNumber")
        .populate("baseId", "name location");
    } catch (error) {
      console.error("Error fetching inventory:", error.message);
      throw error;
    }
  },

  async recordPurchase({ baseId, assetId, quantity }, userId, ipAddress) {
    try {
      const { purchase, newQuantity, previousQuantity } =
        await runWithOptionalTransaction("recordPurchase", async (session) => {
          const inventory = await queryWithSession(
            Inventory.findOne({ baseId, assetId }),
            session,
          );
          if (!inventory) {
            throw new AppError("Inventory record not found", 404);
          }

          const previousQuantity = inventory.currentQuantity;
          inventory.currentQuantity += quantity;
          await saveWithSession(inventory, session);

          const purchase = new Purchase({
            baseId,
            assetId,
            quantity,
            createdBy: userId,
            date: new Date(),
          });
          await saveWithSession(purchase, session);

          return {
            purchase,
            previousQuantity,
            newQuantity: inventory.currentQuantity,
          };
        });

      await auditService.logAction({
        userId,
        action: "RECORD_PURCHASE",
        entityType: "Purchase",
        entityId: purchase._id,
        changes: { quantity, previousQuantity, newQuantity },
        ipAddress,
      });

      console.log(
        `Purchase recorded: ${quantity} units, Base ${baseId}, Asset ${assetId}`,
      );
      return purchase;
    } catch (error) {
      console.error("Error recording purchase:", error.message);
      throw error;
    }
  },

  async recordTransfer(
    { fromBaseId, toBaseId, assetId, quantity },
    userId,
    ipAddress,
  ) {
    try {
      const { transfer, sourceNewQuantity, destNewQuantity } =
        await runWithOptionalTransaction("recordTransfer", async (session) => {
          const sourceInventory = await queryWithSession(
            Inventory.findOne({ baseId: fromBaseId, assetId }),
            session,
          );
          if (!sourceInventory || sourceInventory.currentQuantity < quantity) {
            throw new AppError("Insufficient stock in source base", 400);
          }

          const destInventory = await queryWithSession(
            Inventory.findOne({ baseId: toBaseId, assetId }),
            session,
          );
          if (!destInventory) {
            throw new AppError("Asset not tracked in destination base", 404);
          }

          sourceInventory.currentQuantity -= quantity;
          await saveWithSession(sourceInventory, session);

          destInventory.currentQuantity += quantity;
          await saveWithSession(destInventory, session);

          const transfer = new Transfer({
            fromBaseId,
            toBaseId,
            assetId,
            quantity,
            createdBy: userId,
            date: new Date(),
          });
          await saveWithSession(transfer, session);

          return {
            transfer,
            sourceNewQuantity: sourceInventory.currentQuantity,
            destNewQuantity: destInventory.currentQuantity,
          };
        });

      await auditService.logAction({
        userId,
        action: "RECORD_TRANSFER",
        entityType: "Transfer",
        entityId: transfer._id,
        changes: {
          quantity,
          fromBaseId,
          toBaseId,
          sourceNewQuantity,
          destNewQuantity,
        },
        ipAddress,
      });

      console.log(
        `Transfer recorded: ${quantity} units from Base ${fromBaseId} to ${toBaseId}`,
      );
      return transfer;
    } catch (error) {
      console.error("Error recording transfer:", error.message);
      throw error;
    }
  },

  async assignAsset(
    { baseId, assetId, personnelName, personnelId, quantity },
    userId,
    ipAddress,
  ) {
    try {
      const { assignment, previousQuantity, newQuantity } =
        await runWithOptionalTransaction("assignAsset", async (session) => {
          const inventory = await queryWithSession(
            Inventory.findOne({ baseId, assetId }),
            session,
          );
          if (!inventory || inventory.currentQuantity < quantity) {
            throw new AppError("Insufficient stock for assignment", 400);
          }

          const previousQuantity = inventory.currentQuantity;
          inventory.currentQuantity -= quantity;
          await saveWithSession(inventory, session);

          const assignment = new Assignment({
            baseId,
            assetId,
            personnelName,
            personnelId,
            quantity,
            assignedBy: userId,
            date: new Date(),
          });
          await saveWithSession(assignment, session);

          return {
            assignment,
            previousQuantity,
            newQuantity: inventory.currentQuantity,
          };
        });

      await auditService.logAction({
        userId,
        action: "ASSIGN_ASSET",
        entityType: "Assignment",
        entityId: assignment._id,
        changes: { quantity, previousQuantity, newQuantity, personnelId },
        ipAddress,
      });

      console.log(`Asset assigned: ${quantity} units to ${personnelName}`);
      return assignment;
    } catch (error) {
      console.error("Error assigning asset:", error.message);
      throw error;
    }
  },

  async recordExpenditure(
    { baseId, assetId, quantity, reason },
    userId,
    ipAddress,
  ) {
    try {
      const { expenditure, previousQuantity, newQuantity } =
        await runWithOptionalTransaction("recordExpenditure", async (session) => {
          const inventory = await queryWithSession(
            Inventory.findOne({ baseId, assetId }),
            session,
          );
          if (!inventory || inventory.currentQuantity < quantity) {
            throw new AppError("Insufficient stock for expenditure", 400);
          }

          const previousQuantity = inventory.currentQuantity;
          inventory.currentQuantity -= quantity;
          await saveWithSession(inventory, session);

          const expenditure = new Expenditure({
            baseId,
            assetId,
            quantity,
            reason,
            recordedBy: userId,
            date: new Date(),
          });
          await saveWithSession(expenditure, session);

          return {
            expenditure,
            previousQuantity,
            newQuantity: inventory.currentQuantity,
          };
        });

      await auditService.logAction({
        userId,
        action: "RECORD_EXPENDITURE",
        entityType: "Expenditure",
        entityId: expenditure._id,
        changes: { quantity, reason, previousQuantity, newQuantity },
        ipAddress,
      });

      console.log(`Expenditure recorded: ${quantity} units, Reason: ${reason}`);
      return expenditure;
    } catch (error) {
      console.error("Error recording expenditure:", error.message);
      throw error;
    }
  },
};
