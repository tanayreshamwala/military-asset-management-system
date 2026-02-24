import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    baseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Base",
      required: true,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    openingBalance: { type: Number, default: 0 },
    currentQuantity: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

inventorySchema.index({ baseId: 1, assetId: 1 });

export default mongoose.model("Inventory", inventorySchema);
