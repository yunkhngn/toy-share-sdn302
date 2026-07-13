import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../setup.js";
import User from "../../src/models/User.js";
import Toy from "../../src/models/Toy.js";
import BorrowRequest from "../../src/models/BorrowRequest.js";

beforeAll(async () => {
  await connectTestDB();
  await BorrowRequest.syncIndexes();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

async function makeToyWithOwner() {
  const owner = await User.create({
    name: "Owner",
    email: `owner-${Date.now()}-${Math.random()}@example.com`,
    password: "secret123",
  });
  const toy = await Toy.create({
    owner: owner._id,
    name: "Puzzle",
    description: "500 pieces",
    category: "educational",
    ageRange: "6-8",
    condition: "good",
  });
  return { owner, toy };
}

describe("BorrowRequest model", () => {
  it("defaults status to requested", async () => {
    const { owner, toy } = await makeToyWithOwner();
    const borrower = await User.create({
      name: "Borrower",
      email: `borrower-${Date.now()}@example.com`,
      password: "secret123",
    });

    const request = await BorrowRequest.create({
      toy: toy._id,
      borrower: borrower._id,
      owner: owner._id,
      borrowDate: new Date("2026-08-01"),
      returnDate: new Date("2026-08-10"),
    });

    expect(request.status).toBe("requested");
  });

  it("rejects an invalid status", async () => {
    const { owner, toy } = await makeToyWithOwner();

    await expect(
      BorrowRequest.create({
        toy: toy._id,
        borrower: owner._id,
        owner: owner._id,
        status: "on-hold",
        borrowDate: new Date("2026-08-01"),
        returnDate: new Date("2026-08-10"),
      })
    ).rejects.toThrow();
  });

  it("rejects when returnDate is not after borrowDate", async () => {
    const { owner, toy } = await makeToyWithOwner();

    await expect(
      BorrowRequest.create({
        toy: toy._id,
        borrower: owner._id,
        owner: owner._id,
        borrowDate: new Date("2026-08-10"),
        returnDate: new Date("2026-08-01"),
      })
    ).rejects.toThrow();
  });

  it("requires toy, borrower, owner, borrowDate, and returnDate", async () => {
    await expect(BorrowRequest.create({})).rejects.toThrow();
  });
});
