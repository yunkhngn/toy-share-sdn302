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
