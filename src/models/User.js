import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const preferencesSchema = new mongoose.Schema(
  {
    targetRole: { type: String, trim: true, maxlength: 120, default: "" },
    experienceLevel: {
      type: String,
      enum: ["student", "entry", "mid", "senior", "lead"],
      default: "entry"
    },
    preferredPace: {
      type: String,
      enum: ["relaxed", "steady", "intensive"],
      default: "steady"
    },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"]
    },
    passwordHash: { type: String, required: true, select: false },
    preferences: { type: preferencesSchema, default: () => ({}) },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    tokenVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    preferences: this.preferences,
    createdAt: this.createdAt
  };
};

export const User = mongoose.model("User", userSchema);
