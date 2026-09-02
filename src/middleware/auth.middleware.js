import config from "../config/config.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.util.js";
import userModel from "../models/user.model.js";

export default async function authHandler(req, res, next) {
  const header = req.get("Authorization") ?? "";
  const [, accessToken] = header.split(" ") ?? [];

  if (!accessToken) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(accessToken, config.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired.");
    }
    throw new ApiError(401, "Invalid access token");
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  req.user = user;
  next();
}