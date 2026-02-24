import { body, validationResult } from "express-validator";
import { AppError } from "../utils/errors.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(", ");
    throw new AppError(message, 400);
  }
  next();
};

export const validateAuth = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validate,
];

export const validateUser = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["admin", "base_commander", "logistics_officer"])
    .withMessage("Invalid role"),
  validate,
];

export const validateBase = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  validate,
];

export const validateAsset = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("type")
    .isIn(["Vehicle", "Weapon", "Ammunition", "Equipment"])
    .withMessage("Invalid asset type"),
  body("serialNumber")
    .trim()
    .notEmpty()
    .withMessage("Serial number is required"),
  validate,
];

export const validateInventory = [
  body("baseId").isMongoId().withMessage("Invalid base ID"),
  body("assetId").isMongoId().withMessage("Invalid asset ID"),
  body("openingBalance")
    .isInt({ min: 0 })
    .withMessage("Opening balance must be non-negative"),
  validate,
];

export const validatePurchase = [
  body("baseId").isMongoId().withMessage("Invalid base ID"),
  body("assetId").isMongoId().withMessage("Invalid asset ID"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  validate,
];

export const validateTransfer = [
  body("fromBaseId").isMongoId().withMessage("Invalid source base ID"),
  body("toBaseId").isMongoId().withMessage("Invalid destination base ID"),
  body("assetId").isMongoId().withMessage("Invalid asset ID"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  validate,
];

export const validateAssignment = [
  body("baseId").isMongoId().withMessage("Invalid base ID"),
  body("assetId").isMongoId().withMessage("Invalid asset ID"),
  body("personnelName")
    .trim()
    .notEmpty()
    .withMessage("Personnel name is required"),
  body("personnelId").trim().notEmpty().withMessage("Personnel ID is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  validate,
];

export const validateExpenditure = [
  body("baseId").isMongoId().withMessage("Invalid base ID"),
  body("assetId").isMongoId().withMessage("Invalid asset ID"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("reason").trim().notEmpty().withMessage("Reason is required"),
  validate,
];
