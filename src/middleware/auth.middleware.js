import config from "../config/config.js";
import jwt from "jsonwebtoken";

export default function authHandler(req, res, next) {
  const header = req.get("Authorization") ?? "";
  const [, accessToken] = header.split(" ") ?? [];

  if (!accessToken) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }
  return;
}