// models
import walletModel from "../models/wallet.model.js";

// utils
import ApiError from "../utils/apiError.util.js";
import formatList from "../utils/formatList.util.js";

function getWalletValidationError(name, balance) {
  const missing = [];

  if (name === undefined || name === null || name.trim() === "") {
    missing.push("name");
  }

  if (balance === undefined || balance === null) {
    missing.push("balance");
  }

  if (missing.length > 0) {
    return formatList(missing);
  }

  if (typeof balance !== "number" || Number.isNaN(balance) || balance < 0) {
    return "Balance must be a non-negative number.";
  }

  return null;
}

export async function createWallet(req, res) {
  const { name, balance } = req.body;

  const errorMessage = getWalletValidationError(name, balance);
  if (errorMessage) {
    throw new ApiError(400, errorMessage);
  }

  const user = req.user;
  const trimmedName = name.trim();

  let wallet;
  try {
    wallet = await walletModel.create({
      userId: user._id,
      name: trimmedName,
      balance,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Wallet with this name already exists.");
    }
    throw error;
  }

  res.status(201).json({
    message: "Wallet created successfully.",
    wallet,
  });
}

export async function getAllWallets(req, res) {
  const user = req.user;

  const wallets = await walletModel.find({ userId: user._id });

  res.status(200).json({
    message: "Wallets fetched successfully.",
    wallets,
  });
}

export async function getWallet(req, res) {
  const { id } = req.params;
  const user = req.user;

  const wallet = await walletModel.findOne({ _id: id, userId: user._id });

  if (!wallet) {
    throw new ApiError(404, "Wallet not found.");
  }

  res.status(200).json({
    message: "Wallet fetched successfully.",
    wallet,
  });
}

export async function updateWallet(req, res) {
  const { id } = req.params;
  const { name, balance } = req.body;
  const user = req.user;

  if (name === undefined && balance === undefined) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const updates = {};

  if (name !== undefined) {
    const trimmedName = name.trim();
    if (trimmedName === "") {
      throw new ApiError(400, "Wallet name cannot be empty.");
    }
    updates.name = trimmedName;
  }

  if (balance !== undefined) {
    if (typeof balance !== "number" || Number.isNaN(balance)) {
      throw new ApiError(400, "Balance must be a number.");
    }
    updates.balance = balance;
  }

  let wallet;
  try {
    wallet = await walletModel.findOneAndUpdate(
      { _id: id, userId: user._id },
      updates,
      { returnDocument: "after", runValidators: true }
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Wallet with this name already exists.");
    }
    throw error;
  }

  if (!wallet) {
    throw new ApiError(404, "Wallet not found.");
  }

  res.status(200).json({
    message: "Wallet updated successfully.",
    wallet,
  });
}

export async function deleteWallet(req, res) {
  const { id } = req.params;
  const user = req.user;

  const wallet = await walletModel.findOneAndDelete({ _id: id, userId: user._id });

  if (!wallet) {
    throw new ApiError(404, "Wallet not found.");
  }

  res.status(200).json({
    message: "Wallet deleted successfully.",
  });
}