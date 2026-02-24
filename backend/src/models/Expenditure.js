import mongoose from "mongoose";

const expenditureSchema = new mongoose.Schema(
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
    reason: { type: String, required: true },
    date: { type: Date, default: Date.now },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

expenditureSchema.index({ baseId: 1, assetId: 1 });
expenditureSchema.index({ createdAt: 1 });

export default mongoose.model("Expenditure", expenditureSchema);
