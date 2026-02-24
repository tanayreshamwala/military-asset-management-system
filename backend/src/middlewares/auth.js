import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("No token provided", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      throw new AppError("Invalid or expired token", 401);
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const exemptAuthMiddleware = (req, res, next) => {
  next();
};
