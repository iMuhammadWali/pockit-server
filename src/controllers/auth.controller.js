import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username) {
      res.status(400).json({
        message: "username is required",
      });
      return;
    }

    if (!email) {
      res.status(400).json({
        message: "email is required",
      });
      return;
    }

    if (!password) {
      res.status(400).json({
        message: "password is required",
      });
      return;
    }

    const isAlreadyRegistered = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    // I dont think I should make username unique.
    if (isAlreadyRegistered) {
      res.status(409).json({
        message: "Username or email already exists",
      });
      return;
    }

    const hashedPassword = crypto
      .createHash("sha256") // returns a hash object
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
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
}

// This function returns the username, email, refresh and access token.
export async function login(req, res) {
  console.log("Login request");
  try {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({
        message: "email is required",
      });
      return;
    }

    if (!password) {
      res.status(400).json({
        message: "password is required",
      });
      return;
    }

    const user = await userModel.findOne({
      email,
    });

    if (!user) {
      res.status(401).json({
        message: "User is not registered.",
      });
      return;
    }

    const storedPasswordHash = user.password;
    const loginAttemptPasswordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const isEqual = crypto.timingSafeEqual(
      Buffer.from(storedPasswordHash, "hex"),
      Buffer.from(loginAttemptPasswordHash, "hex"),
    );

    if (!isEqual) {
      res.status(401).json({
        message: "Password is wrong",
      });
      return;
    }

    const accessToken = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      { expiresIn: "7d" },
    );


    res.status(200).json({
      message: "User logged in successfully.",
      user: {
        username: user.username,
        email,
      },
      refreshToken,
      accessToken,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
}

export async function getMe(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      message: "token not found",
    });
    return;
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);
  console.log(decoded);

  const user = await userModel.findOne({
    _id: decoded.id,
  });
  if (user) {
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
export async function rotateToken(req, res) {}
