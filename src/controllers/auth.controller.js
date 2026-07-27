import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import catchAsync from "../utils/catchAsync.util.js";
import sessionModel from "../models/session.model.js";
import ApiError from "../utils/apiError.util.js";

const REFRESH_TOKEN_BYTES = 32;

function formatList(items) {
  if (items.length === 1) {
    return `${items[0]} is required.`;
  }

  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]} are required.`;
}

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
  const expiresAt = new Date(
    Date.now() + config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000,
  );
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

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

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
  const loginAttemptPasswordHash = crypto.createHash("sha256").update(password).digest("hex");

  // Some function that prevents hackers from guessing how far they are from actual password.
  const isEqual = crypto.timingSafeEqual(
    Buffer.from(storedPasswordHash, "hex"),
    Buffer.from(loginAttemptPasswordHash, "hex"),
  );

  if (!isEqual) {
    throw new ApiError(401, "Password is wrong");
  }

  const accessToken = jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    config.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = createRefreshToken();

  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken.rawToken).digest('hex');
  const session = sessionModel.create({
    userId: user._id,
    refreshTokenHash,
  });

  res.status(200).json({
    message: "User logged in successfully.",
    user: {
      username: user.username,
      email,
    },
    refreshToken,
    accessToken,
  });
}

export async function getMe(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "token not found");
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);
  console.log(decoded);

  const user = await userModel.findOne({
    _id: decoded.id,
  });
  if (!user) {
    // Will think later when I will need this route.
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
export async function rotateRefreshAndAccessToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required.");
  }



}
