import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export const requireSignIn = async (req, res, next) => {
  try {
    console.log(req.headers.authorization)
    const decoded = jwt.verify(req.headers.authorization, JWT_SECRET);
    req.user = decoded; // req.user._id
    next()
  } catch (err) {
    console.log(err);
    res.status(404).json({ error: "Invalid or expired token" });
  }
};
