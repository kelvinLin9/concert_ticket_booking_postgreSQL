import express from 'express';
import { isAuthenticated, optionalAuth } from '../middlewares/auth';
import ticketController from '../controller/ticket';

const router = express.Router();

/**
 * @swagger
 * /api/tickets/my:
 *   get:
 *     summary: 獲取當前用戶的所有票券
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 獲取票券列表成功
 */
router.get('/my', isAuthenticated, ticketController.getUserTickets);

/**
 * @swagger
 * /api/tickets/{ticketId}:
 *   get:
 *     summary: 獲取票券詳情
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 獲取票券詳情成功
 */
router.get('/:ticketId', optionalAuth, ticketController.getTicketById);

/**
 * @swagger
 * /api/tickets/{ticketId}/verify:
 *   post:
 *     summary: 驗證票券（主辦方使用）
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrCode
 *             properties:
 *               qrCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: 票券驗證成功
 */
router.post('/:ticketId/verify', ticketController.verifyTicket);

/**
 * @swagger
 * /api/tickets/{ticketId}:
 *   put:
 *     summary: 更新票券
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newUserId:
 *                 type: string
 *               regenerateQR:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 票券更新成功
 */
router.put('/:ticketId', isAuthenticated, ticketController.updateTicket);

/**
 * @swagger
 * /api/v1/ticket/{concert}:
 *   get:
 *     summary: 獲取指定演唱會的所有票券資訊
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: concert
 *         required: true
 *         schema:
 *           type: string
 *         description: 演唱會ID (concertId)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, sold-out, all]
 *         description: 過濾票券狀態，預設為 'all'
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, name_asc, name_desc]
 *         description: 排序方式，預設為 'price_asc'
 *     responses:
 *       200:
 *         description: 獲取演唱會票券成功
 *       404:
 *         description: 找不到該演唱會
 */
router.get('/:concert', ticketController.getTicketsByConcert);

export default router; 