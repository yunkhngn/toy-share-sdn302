import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../setup.js";
import User from "../../src/models/User.js";

beforeAll(async () => {
  await connectTestDB();
  await User.syncIndexes();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("User model", () => {
  it("hashes the password before saving and exposes comparePassword", async () => {
    const user = await User.create({
      name: "Alice",
      email: "alice@example.com",
      password: "secret123",
    });

    expect(user.password).not.toBe("secret123");
    expect(await user.comparePassword("secret123")).toBe(true);
    expect(await user.comparePassword("wrong")).toBe(false);
  });

  it("rejects duplicate emails", async () => {
    await User.create({
      name: "Alice",
      email: "dup@example.com",
      password: "secret123",
    });

    await expect(
      User.create({ name: "Bob", email: "dup@example.com", password: "secret123" })
    ).rejects.toThrow();
  });

  it("requires name, email, and password", async () => {
    await expect(User.create({})).rejects.toThrow();
  });

  it("excludes the password field when serialized to JSON", async () => {
    const user = await User.create({
      name: "Carol",
      email: "carol@example.com",
      password: "secret123",
    });

    expect(user.toJSON().password).toBeUndefined();
  });
});
