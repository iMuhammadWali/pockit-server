// third-party
import crypto from "crypto";
import jwt from "jsonwebtoken";

// config
import config from "../config/config.js";

// models
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";

// utils
import ApiError from "../utils/apiError.util.js";
import formatList from "../utils/formatList.util.js";

const REFRESH_TOKEN_BYTES = 32;

function getCredentialError(username, email, password, isRegister = false) {
  const missing = [];
  if (isRegister && !username) {
    missing.push("username");
  }
  if (!email) {
    missing.push("email");
  }
  if (!password) {
    missing.push("password");
  }
  if (missing.length > 0) {
    return formatList(missing);
  }

  return null;
}

// This function generates a very random token of 32 bytes (64 Hex digits).
function createRefreshToken() {
  const bytes = crypto.randomBytes(REFRESH_TOKEN_BYTES);
  const rawToken = bytes.toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return { rawToken, expiresAt };
}

// Creates a new user and sends 201.
export async function register(req, res) {
  const { username, email, password } = req.body;

  const errorMessage = getCredentialError(username, email, password, true);
  if (errorMessage) {
    throw new ApiError(400, errorMessage);
  }

  const isAlreadyRegistered = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  // I dont think I should make username unique.
  if (isAlreadyRegistered) {
    throw new ApiError(409, "Username or email already exists");
  }

  const hashedPassword = createHash(password);

  // Need to abstract this but will do all of that after completing the auth system.
  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
  });

  // Send a message, user details, and the token back to the client.
  res.status(201).json({
    message: "User registered successfully",
  });
}

// This function returns the username, email, refresh and access token.
export async function login(req, res) {
  const { email, password } = req.body;

  const errorMessage = getCredentialError(null, email, password);
  if (errorMessage) {
    throw new ApiError(400, errorMessage);
  }

  const user = await userModel.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(401, "User is not registered.");
  }

  const storedPasswordHash = user.password;
  const loginAttemptPasswordHash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  // Some function that prevents hackers from guessing how far they are from actual password.
  const isEqual = crypto.timingSafeEqual(
    Buffer.from(storedPasswordHash, "hex"),
    Buffer.from(loginAttemptPasswordHash, "hex"),
  );

  if (!isEqual) {
    throw new ApiError(401, "Password is wrong");
  }

  const accessToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = createRefreshToken();

  const refreshTokenHash = createHash(refreshToken.rawToken);
  const session = await sessionModel.create({
    userId: user._id,
    refreshTokenHash,
    expiresAt: refreshToken.expiresAt,
  });

  res.status(200).json({
    message: "User logged in successfully.",
    user: {
      username: user.username,
      email,
    },
    refreshToken: refreshToken.rawToken,
    accessToken,
  });
}

// This function needs second chance.
export async function getMe(req, res) {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    throw new ApiError(401, "token not found");
  }

  try {
    const decoded = jwt.verify(accessToken, config.JWT_SECRET);
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired.");
    }
    throw new ApiError(401, "Invalid access token");
  }

  const user = await userModel.findOne({
    _id: decoded.id,
  });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res.status(200).json({
    message: "User fetched successfully",
    user: {
      username: user.username,
      email: user.email,
    },
  });
}

// get the refresh token from cookie.
// revoke it from session.
// generate a new access and new refresh token.

function createHash(string) {
  return crypto.createHash("sha256").update(string).digest("hex");
}

export async function rotate(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required.");
  }

  const session = await sessionModel.findOne({
    refreshTokenHash: createHash(refreshToken),
  });

  // if the refresh token is malformed (or is fake) there is no session
  // created by the server for it.
  if (!session) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  // if the session is revoked (user logged out)
  // no need to rotate it.
  if (session.revokedAt) {
    throw new ApiError(401, "Refresh token has been revoked.");
  }

  if (session.expiresAt < new Date()) {
    throw new ApiError(401, "Refresh token has expired.");
  }

  const accessToken = jwt.sign({ id: session.userId }, config.JWT_SECRET, {
    expiresIn: "15m",
  });

  const newRefreshToken = createRefreshToken();
  session.refreshTokenHash = createHash(newRefreshToken.rawToken);
  session.expiresAt = newRefreshToken.expiresAt;
  await session.save();

  res.status(200).json({
    message: "Token refreshed successfully.",
    refreshToken: newRefreshToken.rawToken,
    accessToken,
  });
}

export async function logout(req, res) {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const session = await sessionModel.findOne({
      refreshTokenHash: createHash(refreshToken)
    });

    if (session){
      session.revokedAt = new Date();
      await session.save();
    }
  }
  res.status(200).json({
    message: "Logged out successfully.",
  });
}
