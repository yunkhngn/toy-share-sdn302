import mongoose from "mongoose";

export const TOY_CATEGORIES = [
  "educational",
  "outdoor",
  "boardgame",
  "doll",
  "vehicle",
  "other",
];
export const TOY_CONDITIONS = ["new", "good", "used"];
export const TOY_STATUSES = ["available", "borrowed", "unavailable"];

const toySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: TOY_CATEGORIES },
    ageRange: { type: String, required: true },
    condition: { type: String, required: true, enum: TOY_CONDITIONS },
    images: { type: [String], default: [] },
    status: { type: String, enum: TOY_STATUSES, default: "available" },
  },
  { timestamps: true }
);

toySchema.index({ name: "text", description: "text" });
toySchema.index({ category: 1, status: 1 });

export default mongoose.model("Toy", toySchema);
