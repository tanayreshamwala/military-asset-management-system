import jwt from "jsonwebtoken";

export const generateToken = (userId, role, baseId) => {
  return jwt.sign(
    { userId, role, baseId },
    process.env.JWT_SECRET || "secret",
    { expiresIn: process.env.JWT_EXPIRY || "1h" },
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "secret");
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
};
