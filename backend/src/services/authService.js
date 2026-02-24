import User from "../models/User.js";
import { AppError } from "../utils/errors.js";
import { generateToken } from "../utils/jwt.js";

export const authService = {
  async register(userData) {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new AppError("Email already registered", 400);
      }

      const user = new User(userData);
      await user.save();

      console.log(`User registered: ${user.email}`);
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        baseId: user.baseId,
      };
    } catch (error) {
      console.error("Registration error:", error.message);
      throw error;
    }
  },

  async login(email, password) {
    try {
      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.matchPassword(password))) {
        throw new AppError("Invalid email or password", 401);
      }

      const token = generateToken(
        user._id.toString(),
        user.role,
        user.baseId?.toString(),
      );

      console.log(`User logged in: ${user.email}`);
      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          baseId: user.baseId,
        },
        token,
      };
    } catch (error) {
      console.error("Login error:", error.message);
      throw error;
    }
  },

  async getUser(userId) {
    try {
      const user = await User.findById(userId).select("-password");
      if (!user) {
        throw new AppError("User not found", 404);
      }
      return user;
    } catch (error) {
      console.error("Get user error:", error.message);
      throw error;
    }
  },
};
