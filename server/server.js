import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import { DATABASE } from "./config.js";
import authRoutes from "./routes/auth.js";
import adRoutes from "./routes/ad.js";

const app = express();

// db
mongoose.set("strictQuery", false);
mongoose
  .connect(DATABASE)
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });

// middlewares
// ensure our app can receive json data sending from POST request from client
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(cors());

// routes
app.use("/api", authRoutes);
app.use("/api", adRoutes);

app.listen(8000, () => {
  console.log("server running on port 8000");
});
