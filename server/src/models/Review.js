import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    toy: { type: mongoose.Schema.Types.ObjectId, ref: "Toy", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowRequest",
      required: true,
      unique: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: null },
  },
  { timestamps: true }
);

reviewSchema.index({ toy: 1 });

export default mongoose.model("Review", reviewSchema);
