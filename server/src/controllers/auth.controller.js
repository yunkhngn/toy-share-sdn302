import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import * as authService from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, "name, email and password are required");
  }

  const { user, token } = await authService.register({ name, email, password });
  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const { user, token } = await authService.login({ email, password });
  res.json({ user, token });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  res.json({ user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await authService.updateProfile(req.user._id, { name, avatar });
  res.json({ user });
});
