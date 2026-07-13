import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import * as requestService from "../services/request.service.js";

export const createRequest = asyncHandler(async (req, res) => {
  const { toyId, borrowDate, returnDate, message } = req.body;
  if (!toyId || !borrowDate || !returnDate) {
    throw new ApiError(400, "toyId, borrowDate and returnDate are required");
  }

  const request = await requestService.createRequest(req.user._id, {
    toyId,
    borrowDate,
    returnDate,
    message,
  });
  res.status(201).json({ request });
});

export const listBorrowed = asyncHandler(async (req, res) => {
  const requests = await requestService.listBorrowed(req.user._id, req.query.status);
  res.json({ requests });
});

export const listLent = asyncHandler(async (req, res) => {
  const requests = await requestService.listLent(req.user._id, req.query.status);
  res.json({ requests });
});

export const approveRequest = asyncHandler(async (req, res) => {
  const request = await requestService.approveRequest(req.params.id, req.user._id);
  res.json({ request });
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await requestService.rejectRequest(req.params.id, req.user._id);
  res.json({ request });
});

export const cancelRequest = asyncHandler(async (req, res) => {
  const request = await requestService.cancelRequest(req.params.id, req.user._id);
  res.json({ request });
});

export const reportReturn = asyncHandler(async (req, res) => {
  const request = await requestService.reportReturn(req.params.id, req.user._id);
  res.json({ request });
});

export const confirmReturn = asyncHandler(async (req, res) => {
  const request = await requestService.confirmReturn(req.params.id, req.user._id);
  res.json({ request });
});
