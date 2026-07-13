import { asyncHandler } from "../utils/asyncHandler.js";
import * as toyService from "../services/toy.service.js";
import * as reviewService from "../services/review.service.js";

export const listToys = asyncHandler(async (req, res) => {
  const { search, category, ageRange, condition, status, page, limit } = req.query;
  const result = await toyService.listToys({ search, category, ageRange, condition, status, page, limit });
  res.json(result);
});

export const getToyById = asyncHandler(async (req, res) => {
  const toy = await toyService.getToyById(req.params.id);
  const { reviews, avgRating } = await reviewService.listByToy(req.params.id);
  res.json({ toy, reviews, avgRating });
});

export const listMyToys = asyncHandler(async (req, res) => {
  const toys = await toyService.listMyToys(req.user._id);
  res.json({ toys });
});

export const createToy = asyncHandler(async (req, res) => {
  const images = (req.files || []).map((file) => `/uploads/${file.filename}`);
  const toy = await toyService.createToy(req.user._id, { ...req.body, images });
  res.status(201).json({ toy });
});

export const updateToy = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (req.files && req.files.length > 0) {
    updates.images = req.files.map((file) => `/uploads/${file.filename}`);
  }
  const toy = await toyService.updateToy(req.params.id, req.user._id, updates);
  res.json({ toy });
});

export const deleteToy = asyncHandler(async (req, res) => {
  await toyService.deleteToy(req.params.id, req.user._id);
  res.status(204).send();
});
