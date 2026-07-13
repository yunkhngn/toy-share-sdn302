import Toy, { TOY_CATEGORIES, TOY_CONDITIONS } from "../models/Toy.js";
import { ApiError } from "../utils/ApiError.js";

export async function listToys({ search, category, ageRange, condition, status, page = 1, limit = 12 }) {
  const filter = {};
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (ageRange) filter.ageRange = ageRange;
  if (condition) filter.condition = condition;
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
    throw new ApiError(400, "name, description and ageRange are required");
  }
  if (!TOY_CATEGORIES.includes(category)) throw new ApiError(400, "Invalid category");
  if (!TOY_CONDITIONS.includes(condition)) throw new ApiError(400, "Invalid condition");

  return Toy.create({
    owner: ownerId,
    name,
    description,
    category,
    ageRange,
    condition,
    images: images || [],
  });
}

export async function updateToy(toyId, ownerId, updates) {
  const toy = await Toy.findById(toyId);
  if (!toy) throw new ApiError(404, "Toy not found");
  if (toy.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "Only the owner can edit this toy");
  }
  if (toy.status === "borrowed") {
    throw new ApiError(409, "Cannot edit a toy that is currently borrowed");
  }

  const allowedFields = ["name", "description", "category", "ageRange", "condition", "images"];
  for (const field of allowedFields) {
    if (updates[field] !== undefined) toy[field] = updates[field];
  }
  await toy.save();
  return toy;
}

export async function deleteToy(toyId, ownerId) {
  const toy = await Toy.findById(toyId);
  if (!toy) throw new ApiError(404, "Toy not found");
  if (toy.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "Only the owner can delete this toy");
  }
  if (toy.status === "borrowed") {
    throw new ApiError(409, "Cannot delete a toy that is currently borrowed");
  }
  await toy.deleteOne();
}
