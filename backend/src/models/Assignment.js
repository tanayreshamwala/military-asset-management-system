import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
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
    personnelName: { type: String, required: true },
    personnelId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    date: { type: Date, default: Date.now },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

assignmentSchema.index({ baseId: 1, assetId: 1 });
assignmentSchema.index({ createdAt: 1 });

export default mongoose.model("Assignment", assignmentSchema);
