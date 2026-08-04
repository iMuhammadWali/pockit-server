import express from "express";
import catchAsync from "../utils/catchAsync.util.js";
import * as walletController from "../controllers/wallet.controller.js";

const router = express.Router();

router.post("/", catchAsync(walletController.createWallet));
router.get("/", catchAsync(walletController.getAllWallets));
router.get("/:id", catchAsync(walletController.getWallet));
router.patch("/:id", catchAsync(walletController.updateWallet));
router.delete("/:id", catchAsync(walletController.deleteWallet));

export default router;
