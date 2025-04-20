import express from 'express';
import { isAuthenticated, optionalAuth } from '../middlewares/auth';
import paymentController from '../controller/payment';

const router = express.Router();

/**
 * @swagger
 * /api/v1/payments:
 *   post:
 *     summary: 創建支付請求
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - method
 *               - lockToken
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: 訂單ID
 *               lockToken:
 *                 type: string
 *                 description: 訂單鎖定令牌
 *               method:
 *                 type: string
 *                 description: 支付方式
 *               provider:
 *                 type: string
 *                 description: 金流平台
 *     responses:
 *       201:
 *         description: 支付請求創建成功
 */
router.post('/', optionalAuth, paymentController.createPayment);

/**
 * @swagger
 * /api/v1/payments/{paymentId}/callback:
 *   post:
 *     summary: 處理支付回調
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 支付回調處理成功
 */
router.post('/:paymentId/callback', paymentController.handlePaymentCallback);

/**
 * @swagger
 * /api/v1/payments/{paymentId}:
 *   get:
 *     summary: 獲取支付詳情
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 獲取支付詳情成功
 */
router.get('/:paymentId', optionalAuth, paymentController.getPaymentDetails);

export default router; 