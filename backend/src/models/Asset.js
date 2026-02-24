import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["Vehicle", "Weapon", "Ammunition", "Equipment"],
      required: true,
    },
    serialNumber: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

assetSchema.index({ type: 1 });

export default mongoose.model("Asset", assetSchema);
