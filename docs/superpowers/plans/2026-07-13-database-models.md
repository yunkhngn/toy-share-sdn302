# Database Models Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Mongoose data layer for Toy Sharing — the `User`, `Toy`, `BorrowRequest`, and `Review` models with validation, hooks, and indexes — verified by tests against a real local MongoDB instance.

**Architecture:** Four independent Mongoose schemas in `server/src/models/`, one file each. `User` hashes passwords on save and hides them from JSON output. `Toy` and `BorrowRequest` carry enum-constrained status fields that later API work (not in this plan) will drive through their state machines. `Review` enforces "one review per borrow request" via a unique index. Tests run with Vitest against `mongodb://localhost:27017/toy-share-test` (the `mongod` already running on this machine) — no `mongodb-memory-server` download needed.

**Tech Stack:** Node.js (ESM), Mongoose 8.5, bcryptjs, Vitest 3.

**Out of scope:** Routes, controllers, JWT auth, and business rules like "approving a request auto-rejects the others" — those belong to the Auth and Borrow-flow API plans described in `BRIEF.md` §8 steps 2–5. This plan only builds the schemas those later plans will use.

## Global Constraints

- Server package is ESM (`"type": "module"` in `server/package.json`) — every new file uses `import`/`export`, never `require`.
- Mongoose version is pinned to `^8.5.1` (already installed) — do not upgrade it.
- Field names and enum values must match `BRIEF.md` §4 exactly, verbatim:
  - `Toy.category` enum: `educational | outdoor | boardgame | doll | vehicle | other`
  - `Toy.condition` enum: `new | good | used`
  - `Toy.status` enum: `available | borrowed | unavailable`
  - `BorrowRequest.status` enum: `requested | approved | rejected | canceled | borrowed | returned`
- Use `bcryptjs` (pure JS), not `bcrypt` — the server Docker image is `node:22-alpine`, and `bcrypt`'s native bindings fail to build there without extra system packages.
- No code comments unless documenting a non-obvious constraint (repo convention).
- Do not touch `server/src/config/db.js`, `server/src/app.js`, or `server/src/server.js` — the app-level DB connection already works; this plan only adds the model layer and a separate test-only connection helper.

---

## File Structure

```
server/
├── package.json                     # Modify: add bcryptjs dep, vitest devDep, "test" script
├── vitest.config.js                 # Create: Vitest config
├── src/
│   └── models/
│       ├── User.js                  # Create
│       ├── Toy.js                   # Create
│       ├── BorrowRequest.js         # Create
│       └── Review.js                # Create
└── tests/
    ├── setup.js                     # Create: connect/clear/disconnect helpers for test DB
    └── models/
        ├── user.test.js             # Create
        ├── toy.test.js              # Create
        ├── borrowRequest.test.js    # Create
        └── review.test.js           # Create
```

---

### Task 0: Test infrastructure (Vitest + test DB helpers)

**Files:**
- Modify: `server/package.json`
- Create: `server/vitest.config.js`
- Create: `server/tests/setup.js`

**Interfaces:**
- Produces: `connectTestDB(): Promise<void>`, `clearTestDB(): Promise<void>`, `disconnectTestDB(): Promise<void>` exported from `server/tests/setup.js`. All later tasks' tests import these.

- [ ] **Step 1: Install dependencies**

Run from the repo root:

```bash
cd server && npm install bcryptjs && npm install -D vitest
```

- [ ] **Step 2: Add the `test` script to `server/package.json`**

Edit `server/package.json` so `"scripts"` becomes:

```json
"scripts": {
  "dev": "node --watch src/server.js",
  "start": "node src/server.js",
  "test": "vitest run"
}
```

- [ ] **Step 3: Create `server/vitest.config.js`**

```js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    testTimeout: 15000,
    fileParallelism: false,
  },
});
```

`fileParallelism: false` is required because every test file connects to the same real database (`toy-share-test`) — running files in parallel would let one file's `clearTestDB()` wipe another file's in-progress data.

- [ ] **Step 4: Create `server/tests/setup.js`**

```js
import mongoose from "mongoose";

const TEST_DB_URI =
  process.env.MONGO_URI_TEST || "mongodb://localhost:27017/toy-share-test";

export async function connectTestDB() {
  await mongoose.connect(TEST_DB_URI);
}

export async function clearTestDB() {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

export async function disconnectTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}
```

- [ ] **Step 5: Verify `mongod` is reachable on the host**

Run: `mongosh --eval "db.runCommand({ ping: 1 })" mongodb://localhost:27017`
Expected: output includes `ok: 1`. If it fails, start Mongo first (e.g. `brew services start mongodb-community`) before continuing — every later task's tests depend on this.

- [ ] **Step 6: Commit**

```bash
git add server/package.json server/package-lock.json server/vitest.config.js server/tests/setup.js
git commit -m "chore: add vitest and test DB helpers"
```

---

### Task 1: User model

**Files:**
- Create: `server/src/models/User.js`
- Test: `server/tests/models/user.test.js`

**Interfaces:**
- Consumes: `connectTestDB`, `clearTestDB`, `disconnectTestDB` from `server/tests/setup.js` (Task 0).
- Produces: default export `User` (Mongoose model) from `server/src/models/User.js`, with instance method `comparePassword(candidate: string): Promise<boolean>`. `User.toJSON()` output never includes `password`. Later tasks reference documents via `User._id` for `owner`/`borrower`/`reviewer` fields.

- [ ] **Step 1: Write the failing test**

Create `server/tests/models/user.test.js`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd server && npx vitest run tests/models/user.test.js`
Expected: FAIL — `Cannot find module '../../src/models/User.js'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `server/src/models/User.js`:

```js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd server && npx vitest run tests/models/user.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/models/User.js server/tests/models/user.test.js
git commit -m "feat: add User model with password hashing"
```

---

### Task 2: Toy model

**Files:**
- Create: `server/src/models/Toy.js`
- Test: `server/tests/models/toy.test.js`

**Interfaces:**
- Consumes: test helpers from Task 0; `User` model from Task 1 (to create an `owner` in tests).
- Produces: default export `Toy` (Mongoose model) and named exports `TOY_CATEGORIES`, `TOY_CONDITIONS`, `TOY_STATUSES` (arrays of strings) from `server/src/models/Toy.js`. Later tasks reference `Toy._id` for the `toy` field.

- [ ] **Step 1: Write the failing test**

Create `server/tests/models/toy.test.js`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd server && npx vitest run tests/models/toy.test.js`
Expected: FAIL — `Cannot find module '../../src/models/Toy.js'`.

- [ ] **Step 3: Write the implementation**

Create `server/src/models/Toy.js`:

```js
import mongoose from "mongoose";

export const TOY_CATEGORIES = [
  "educational",
  "outdoor",
  "boardgame",
  "doll",
  "vehicle",
  "other",
];
export const TOY_CONDITIONS = ["new", "good", "used"];
export const TOY_STATUSES = ["available", "borrowed", "unavailable"];

const toySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: TOY_CATEGORIES },
    ageRange: { type: String, required: true },
    condition: { type: String, required: true, enum: TOY_CONDITIONS },
    images: { type: [String], default: [] },
    status: { type: String, enum: TOY_STATUSES, default: "available" },
  },
  { timestamps: true }
);

toySchema.index({ name: "text", description: "text" });
toySchema.index({ category: 1, status: 1 });

export default mongoose.model("Toy", toySchema);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd server && npx vitest run tests/models/toy.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/models/Toy.js server/tests/models/toy.test.js
git commit -m "feat: add Toy model with category/condition/status enums"
```

---

### Task 3: BorrowRequest model

**Files:**
- Create: `server/src/models/BorrowRequest.js`
- Test: `server/tests/models/borrowRequest.test.js`

**Interfaces:**
- Consumes: test helpers from Task 0; `User` from Task 1; `Toy` from Task 2.
- Produces: default export `BorrowRequest` (Mongoose model) and named export `BORROW_REQUEST_STATUSES` (array of strings) from `server/src/models/BorrowRequest.js`. Later tasks (Review) reference `BorrowRequest._id` for the `request` field.

- [ ] **Step 1: Write the failing test**

Create `server/tests/models/borrowRequest.test.js`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd server && npx vitest run tests/models/borrowRequest.test.js`
Expected: FAIL — `Cannot find module '../../src/models/BorrowRequest.js'`.

- [ ] **Step 3: Write the implementation**

Create `server/src/models/BorrowRequest.js`:

```js
import mongoose from "mongoose";

export const BORROW_REQUEST_STATUSES = [
  "requested",
  "approved",
  "rejected",
  "canceled",
  "borrowed",
  "returned",
];

const borrowRequestSchema = new mongoose.Schema(
  {
    toy: { type: mongoose.Schema.Types.ObjectId, ref: "Toy", required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: BORROW_REQUEST_STATUSES,
      default: "requested",
    },
    borrowDate: { type: Date, required: true },
    returnDate: {
      type: Date,
      required: true,
      validate: {
        validator: function isAfterBorrowDate(value) {
          return value > this.borrowDate;
        },
        message: "returnDate must be after borrowDate",
      },
    },
    actualReturnDate: { type: Date, default: null },
    message: { type: String, default: null },
  },
  { timestamps: true }
);

borrowRequestSchema.index({ toy: 1, status: 1 });
borrowRequestSchema.index({ borrower: 1 });
borrowRequestSchema.index({ owner: 1 });

export default mongoose.model("BorrowRequest", borrowRequestSchema);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd server && npx vitest run tests/models/borrowRequest.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/models/BorrowRequest.js server/tests/models/borrowRequest.test.js
git commit -m "feat: add BorrowRequest model with status enum and date validation"
```

---

### Task 4: Review model

**Files:**
- Create: `server/src/models/Review.js`
- Test: `server/tests/models/review.test.js`

**Interfaces:**
- Consumes: test helpers from Task 0; `User` from Task 1; `Toy` from Task 2; `BorrowRequest` from Task 3.
- Produces: default export `Review` (Mongoose model) from `server/src/models/Review.js`.

- [ ] **Step 1: Write the failing test**

Create `server/tests/models/review.test.js`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd server && npx vitest run tests/models/review.test.js`
Expected: FAIL — `Cannot find module '../../src/models/Review.js'`.

- [ ] **Step 3: Write the implementation**

Create `server/src/models/Review.js`:

```js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    toy: { type: mongoose.Schema.Types.ObjectId, ref: "Toy", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowRequest",
      required: true,
      unique: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: null },
  },
  { timestamps: true }
);

reviewSchema.index({ toy: 1 });

export default mongoose.model("Review", reviewSchema);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd server && npx vitest run tests/models/review.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/models/Review.js server/tests/models/review.test.js
git commit -m "feat: add Review model with one-review-per-request constraint"
```

---

### Task 5: Full suite sanity check

**Files:** none (verification only)

- [ ] **Step 1: Run the entire test suite**

Run: `cd server && npm test`
Expected: PASS — all 4 model test files, 17 tests total, 0 failures.

- [ ] **Step 2: Confirm no stray test database artifacts remain on the shared host Mongo**

Run: `mongosh --eval "db.getMongo().getDBNames()" mongodb://localhost:27017`
Expected: `toy-share-test` is NOT in the list (Task 0's `disconnectTestDB` drops it after each file's `afterAll`).
