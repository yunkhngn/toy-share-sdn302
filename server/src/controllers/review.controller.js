import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import * as reviewService from "../services/review.service.js";

export const createReview = asyncHandler(async (req, res) => {
  const { requestId, rating, comment } = req.body;
  if (!requestId || !rating) {
    throw new ApiError(400, "requestId and rating are required");
  }

  const review = await reviewService.createReview(req.user._id, { requestId, rating, comment });
  res.status(201).json({ review });
});

export const listReviewsByToy = asyncHandler(async (req, res) => {
  const result = await reviewService.listByToy(req.params.toyId);
  res.json(result);
});
