import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Missing or invalid Authorization header");
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, "User not found");

    req.user = user;
    next();
  } catch (err) {
    next(err instanceof ApiError ? err : new ApiError(401, "Invalid or expired token"));
  }
}
