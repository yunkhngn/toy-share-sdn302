import BorrowRequest from "../models/BorrowRequest.js";
import Toy from "../models/Toy.js";
import { ApiError } from "../utils/ApiError.js";

export async function createRequest(borrowerId, { toyId, borrowDate, returnDate, message }) {
  const toy = await Toy.findById(toyId);
  if (!toy) throw new ApiError(404, "Toy not found");
  if (toy.owner.toString() === borrowerId.toString()) {
    throw new ApiError(400, "You cannot borrow your own toy");
  }
  if (toy.status !== "available") {
    throw new ApiError(409, "Toy is not available for borrowing");
  }

  return BorrowRequest.create({
    toy: toy._id,
    borrower: borrowerId,
    owner: toy.owner,
    borrowDate,
    returnDate,
    message,
  });
}

export async function listBorrowed(borrowerId, status) {
  const filter = { borrower: borrowerId };
  if (status) filter.status = status;
  return BorrowRequest.find(filter).populate("toy").sort({ createdAt: -1 });
}

export async function listLent(ownerId, status) {
  const filter = { owner: ownerId };
  if (status) filter.status = status;
  return BorrowRequest.find(filter).populate("toy borrower").sort({ createdAt: -1 });
}

async function findOwnedRequest(requestId, ownerId) {
  const request = await BorrowRequest.findById(requestId);
  if (!request) throw new ApiError(404, "Request not found");
  if (request.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "Only the toy owner can perform this action");
  }
  return request;
}

async function findOwnRequest(requestId, borrowerId) {
  const request = await BorrowRequest.findById(requestId);
  if (!request) throw new ApiError(404, "Request not found");
  if (request.borrower.toString() !== borrowerId.toString()) {
    throw new ApiError(403, "Only the borrower can perform this action");
  }
  return request;
}

export async function approveRequest(requestId, ownerId) {
  const request = await findOwnedRequest(requestId, ownerId);
  if (request.status !== "requested") {
    throw new ApiError(409, "Only a requested borrow request can be approved");
  }

  request.status = "borrowed";
  await request.save();

  await Toy.findByIdAndUpdate(request.toy, { status: "borrowed" });

  await BorrowRequest.updateMany(
    { toy: request.toy, status: "requested", _id: { $ne: request._id } },
    { status: "rejected" }
  );

  return request;
}

export async function rejectRequest(requestId, ownerId) {
  const request = await findOwnedRequest(requestId, ownerId);
  if (request.status !== "requested") {
    throw new ApiError(409, "Only a requested borrow request can be rejected");
  }

  request.status = "rejected";
  await request.save();
  return request;
}

export async function cancelRequest(requestId, borrowerId) {
  const request = await findOwnRequest(requestId, borrowerId);
  if (request.status !== "requested") {
    throw new ApiError(409, "Only a requested borrow request can be canceled");
  }

  request.status = "canceled";
  await request.save();
  return request;
}

export async function reportReturn(requestId, borrowerId) {
  const request = await findOwnRequest(requestId, borrowerId);
  if (request.status !== "borrowed") {
    throw new ApiError(409, "Only a borrowed request can be marked as returned");
  }
  if (request.actualReturnDate) {
    throw new ApiError(409, "Return already reported for this request");
  }

  request.actualReturnDate = new Date();
  await request.save();
  return request;
}

export async function confirmReturn(requestId, ownerId) {
  const request = await findOwnedRequest(requestId, ownerId);
  if (request.status !== "borrowed") {
    throw new ApiError(409, "Only a borrowed request can be confirmed as returned");
  }
  if (!request.actualReturnDate) {
    throw new ApiError(409, "Borrower has not reported a return yet");
  }

  request.status = "returned";
  await request.save();

  await Toy.findByIdAndUpdate(request.toy, { status: "available" });

  return request;
}
