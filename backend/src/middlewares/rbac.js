import { AppError } from "../utils/errors.js";

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }

    next();
  };
};

export const restrictToBase = (req, res, next) => {
  // Only allow users to access their own base (non-admins)
  if (req.user.role !== "admin") {
    if (req.body.baseId && req.body.baseId !== req.user.baseId) {
      return next(new AppError("Cannot access other base", 403));
    }
  }
  next();
};
