import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
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
    quantity: { type: Number, required: true, min: 1 },
    date: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

purchaseSchema.index({ baseId: 1, createdAt: 1 });
purchaseSchema.index({ assetId: 1 });

export default mongoose.model("Purchase", purchaseSchema);
