import Toy, { TOY_CATEGORIES, TOY_CONDITIONS } from "../models/Toy.js";
import { ApiError } from "../utils/ApiError.js";

export async function listToys({ search, category, ageRange, condition, status, page = 1, limit = 12 }) {
  const filter = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  if (category) {
    const cats = Array.isArray(category) ? category : category.split(",").filter(Boolean);
    if (cats.length > 0) filter.category = { $in: cats };
  }

  if (ageRange) {
    const ages = Array.isArray(ageRange) ? ageRange : ageRange.split(",").filter(Boolean);
    if (ages.length > 0) filter.ageRange = { $in: ages };
  }

  if (condition) {
    const conds = Array.isArray(condition) ? condition : condition.split(",").filter(Boolean);
    if (conds.length > 0) filter.condition = { $in: conds };
  }

  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Toy.find(filter)
      .populate("owner", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Toy.countDocuments(filter),
  ]);

  return {
    items,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  };
}

export async function getToyById(toyId) {
  const toy = await Toy.findById(toyId).populate("owner", "name avatar");
  if (!toy) throw new ApiError(404, "Toy not found");
  return toy;
}

export async function listMyToys(ownerId) {
  return Toy.find({ owner: ownerId }).sort({ createdAt: -1 });
}

export async function createToy(ownerId, { name, description, category, ageRange, condition, images }) {
  if (!name || !description || !ageRange) {
    throw new ApiError(400, "name, description, ageRange are required");
  }
  return Toy.create({
    owner: ownerId,
    name,
    description,
    category: category || "other",
    ageRange,
    condition: condition || "good",
    images: images || [],
  });
}

export async function updateToy(toyId, ownerId, updates) {
  const toy = await Toy.findById(toyId);
  if (!toy) throw new ApiError(404, "Toy not found");
  if (toy.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "Forbidden");
  }
  Object.assign(toy, updates);
  return toy.save();
}

export async function deleteToy(toyId, ownerId) {
  const toy = await Toy.findById(toyId);
  if (!toy) throw new ApiError(404, "Toy not found");
  if (toy.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "Forbidden");
  }
  if (toy.status === "borrowed") {
    throw new ApiError(400, "Cannot delete borrowed toy");
  }
  return toy.deleteOne();
}
