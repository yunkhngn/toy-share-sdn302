import mongoose from "mongoose";

export const BORROW_REQUEST_STATUSES = [
  "requested",
  "approved",
  "rejected",
  "canceled",
  "borrowed",
  "returned",
];

const borrowRequestSchema = new mongoose.Schema(
  {
    toy: { type: mongoose.Schema.Types.ObjectId, ref: "Toy", required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: BORROW_REQUEST_STATUSES,
      default: "requested",
    },
    borrowDate: { type: Date, required: true },
    returnDate: {
      type: Date,
      required: true,
      validate: {
        validator: function isAfterBorrowDate(value) {
          return value > this.borrowDate;
        },
        message: "returnDate must be after borrowDate",
      },
    },
    actualReturnDate: { type: Date, default: null },
    message: { type: String, default: null },
  },
  { timestamps: true }
);

borrowRequestSchema.index({ toy: 1, status: 1 });
borrowRequestSchema.index({ borrower: 1 });
borrowRequestSchema.index({ owner: 1 });

export default mongoose.model("BorrowRequest", borrowRequestSchema);
