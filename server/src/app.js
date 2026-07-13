import express from "express";
import cors from "cors";
import path from "node:path";
import healthRoute from "./routes/health.route.js";
import authRoute from "./routes/auth.route.js";
import toyRoute from "./routes/toy.route.js";
import requestRoute from "./routes/request.route.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/toys", toyRoute);
app.use("/api/requests", requestRoute);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
