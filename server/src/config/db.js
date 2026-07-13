import mongoose from "mongoose";

export async function connectDB(uri) {
  mongoose.connection.on("connected", () => {
    console.log("[db] connected to MongoDB");
  });
  mongoose.connection.on("error", (err) => {
    console.error("[db] connection error:", err.message);
  });

  await mongoose.connect(uri);
}
