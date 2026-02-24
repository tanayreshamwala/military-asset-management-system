import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    previousState: { type: mongoose.Schema.Types.Mixed },
    newState: { type: mongoose.Schema.Types.Mixed },
    changes: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
  },
  { timestamps: false },
);

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ timestamp: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
