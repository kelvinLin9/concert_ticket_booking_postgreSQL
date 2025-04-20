import express from 'express';
import { isAuthenticated, optionalAuth } from '../middlewares/auth';
import orderController from '../controller/order';

const router = express.Router();

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: 創建訂單（鎖票）
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticketTypeId
 *             properties:
 *               ticketTypeId:
 *                 type: string
 *                 format: uuid
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: 訂單創建成功
 */
router.post('/', optionalAuth, orderController.createOrder);

/**
 * @swagger
 * /api/v1/orders/{orderId}:
 *   get:
 *     summary: 獲取訂單詳情
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: lockToken
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 獲取訂單成功
 */
router.get('/:orderId', optionalAuth, orderController.getOrderById);

/**
 * @swagger
 * /api/v1/orders/{orderId}:
 *   put:
 *     summary: 更新訂單資訊
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: lockToken
 *         required: false
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               purchaserName:
 *                 type: string
 *               purchaserEmail:
 *                 type: string
 *               purchaserPhone:
 *                 type: string
 *               invoiceType:
 *                 type: string
 *               invoiceCarrier:
 *                 type: string
 *     responses:
 *       200:
 *         description: 訂單更新成功
 */
router.put('/:orderId', optionalAuth, orderController.updateOrder);

/**
 * @swagger
 * /api/v1/orders/{orderId}/cancel:
 *   put:
 *     summary: 取消訂單
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: lockToken
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 訂單取消成功
 */
router.put('/:orderId/cancel', optionalAuth, orderController.cancelOrder);

export default router; 