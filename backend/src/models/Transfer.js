import mongoose from "mongoose";

const transferSchema = new mongoose.Schema(
  {
    fromBaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Base",
      required: true,
    },
    toBaseId: {
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

transferSchema.index({ fromBaseId: 1, createdAt: 1 });
transferSchema.index({ toBaseId: 1, createdAt: 1 });
transferSchema.index({ assetId: 1 });

export default mongoose.model("Transfer", transferSchema);
