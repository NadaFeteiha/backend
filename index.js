import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { ResponseHandler } from "./utils/ResponseHandler.js";

// Routers
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import roadmapRouter from "./routes/roadmap.routes.js";
import topicRouter from "./routes/topic.routes.js";

dotenv.config();

// Connect to MongoDB
await mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((e) => console.error(e));

const PORT = process.env.PORT || 4000;

const app = express();

// View Engine
app.set("views", "./views");
app.set("view engine", "pug");

// Middlewares
app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

// API Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/roadmap", roadmapRouter);
app.use("/api/topic", topicRouter);

// Global error handling
app.use((err, req, res, next) => {
  console.error(err);
  ResponseHandler.error(res, err, 500);
});

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
