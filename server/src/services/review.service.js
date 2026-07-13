import Review from "../models/Review.js";
import BorrowRequest from "../models/BorrowRequest.js";
import { ApiError } from "../utils/ApiError.js";

export async function createReview(reviewerId, { requestId, rating, comment }) {
  const request = await BorrowRequest.findById(requestId);
  if (!request) throw new ApiError(404, "Borrow request not found");
  if (request.borrower.toString() !== reviewerId.toString()) {
    throw new ApiError(403, "Only the borrower of this request can leave a review");
  }
  if (request.status !== "returned") {
    throw new ApiError(409, "Can only review a request after the toy has been returned");
  }

  const existing = await Review.findOne({ request: request._id });
  if (existing) throw new ApiError(409, "This request has already been reviewed");

  return Review.create({
    toy: request.toy,
    reviewer: reviewerId,
    request: request._id,
    rating,
    comment,
  });
}

export async function listByToy(toyId) {
  const reviews = await Review.find({ toy: toyId })
    .populate("reviewer", "name avatar")
    .sort({ createdAt: -1 });

  const avgRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return { reviews, avgRating };
}
