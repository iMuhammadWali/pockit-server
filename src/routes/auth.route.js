import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import catchAsync from '../utils/catchAsync.util.js';

const router = express.Router();
router.post("/register", catchAsync(authController.register));
router.post('/login', catchAsync(authController.login));
router.get('/get-me', catchAsync(authController.getMe));
router.post('/rotate', catchAsync(authController.rotate));
router.post('/logout', catchAsync(authController.logout));

export default router;