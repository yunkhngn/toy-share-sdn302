import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../setup.js";
import User from "../../src/models/User.js";
import Toy from "../../src/models/Toy.js";

let owner;

beforeAll(async () => {
  await connectTestDB();
  await Toy.syncIndexes();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

async function makeOwner() {
  return User.create({
    name: "Owner",
    email: `owner-${Date.now()}-${Math.random()}@example.com`,
    password: "secret123",
  });
}

describe("Toy model", () => {
  it("creates a toy with defaults", async () => {
    owner = await makeOwner();

    const toy = await Toy.create({
      owner: owner._id,
      name: "Lego Set",
      description: "A big box of bricks",
      category: "educational",
      ageRange: "3-5",
      condition: "new",
    });

    expect(toy.status).toBe("available");
    expect(toy.images).toEqual([]);
  });

  it("rejects an invalid category", async () => {
    owner = await makeOwner();

    await expect(
      Toy.create({
        owner: owner._id,
        name: "Mystery Toy",
        description: "Not a real category",
        category: "spaceship",
        ageRange: "3-5",
        condition: "new",
      })
    ).rejects.toThrow();
  });

  it("rejects an invalid condition", async () => {
    owner = await makeOwner();

    await expect(
      Toy.create({
        owner: owner._id,
        name: "Old Toy",
        description: "Bad condition value",
        category: "other",
        ageRange: "6-8",
        condition: "broken",
      })
    ).rejects.toThrow();
  });

  it("requires owner, name, description, category, ageRange, and condition", async () => {
    await expect(Toy.create({})).rejects.toThrow();
  });

  it("supports full-text search on name and description", async () => {
    owner = await makeOwner();
    await Toy.create({
      owner: owner._id,
      name: "Wooden Train Set",
      description: "Classic wooden railway",
      category: "vehicle",
      ageRange: "3-5",
      condition: "good",
    });

    const results = await Toy.find({ $text: { $search: "Wooden" } });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Wooden Train Set");
  });
});
