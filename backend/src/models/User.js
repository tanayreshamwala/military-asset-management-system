import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "base_commander", "logistics_officer"],
      required: true,
    },
    baseId: { type: mongoose.Schema.Types.ObjectId, ref: "Base" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
