import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../setup.js";
import User from "../../src/models/User.js";
import Toy from "../../src/models/Toy.js";
import BorrowRequest from "../../src/models/BorrowRequest.js";
import Review from "../../src/models/Review.js";

beforeAll(async () => {
  await connectTestDB();
  await Review.syncIndexes();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

async function makeReturnedRequest() {
  const owner = await User.create({
    name: "Owner",
    email: `owner-${Date.now()}-${Math.random()}@example.com`,
    password: "secret123",
  });
  const borrower = await User.create({
    name: "Borrower",
    email: `borrower-${Date.now()}-${Math.random()}@example.com`,
    password: "secret123",
  });
  const toy = await Toy.create({
    owner: owner._id,
    name: "Board Game",
    description: "Fun for the family",
    category: "boardgame",
    ageRange: "6-8",
    condition: "good",
  });
  const request = await BorrowRequest.create({
    toy: toy._id,
    borrower: borrower._id,
    owner: owner._id,
    status: "returned",
    borrowDate: new Date("2026-08-01"),
    returnDate: new Date("2026-08-10"),
  });
  return { toy, borrower, request };
}

describe("Review model", () => {
  it("creates a review with a rating between 1 and 5", async () => {
    const { toy, borrower, request } = await makeReturnedRequest();

    const review = await Review.create({
      toy: toy._id,
      reviewer: borrower._id,
      request: request._id,
      rating: 4,
      comment: "Great toy!",
    });

    expect(review.rating).toBe(4);
  });

  it("rejects a rating outside 1-5", async () => {
    const { toy, borrower, request } = await makeReturnedRequest();

    await expect(
      Review.create({
        toy: toy._id,
        reviewer: borrower._id,
        request: request._id,
        rating: 6,
      })
    ).rejects.toThrow();
  });

  it("rejects a second review for the same request", async () => {
    const { toy, borrower, request } = await makeReturnedRequest();
    await Review.create({
      toy: toy._id,
      reviewer: borrower._id,
      request: request._id,
      rating: 5,
    });

    await expect(
      Review.create({
        toy: toy._id,
        reviewer: borrower._id,
        request: request._id,
        rating: 3,
      })
    ).rejects.toThrow();
  });

  it("requires toy, reviewer, request, and rating", async () => {
    await expect(Review.create({})).rejects.toThrow();
  });
});
