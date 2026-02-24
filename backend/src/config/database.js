import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb://localhost:27017/military-asset-management",
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
