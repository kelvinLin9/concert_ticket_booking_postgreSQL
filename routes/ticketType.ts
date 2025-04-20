import express from 'express';
import { isAuthenticated, isAdmin } from '../middlewares/auth';
import ticketTypeController from '../controller/ticketType';

const router = express.Router();

/**
 * @swagger
 * /api/ticket-types/concerts/{concertId}:
 *   get:
 *     summary: 獲取演唱會的所有票種
 *     tags: [TicketTypes]
 *     parameters:
 *       - in: path
 *         name: concertId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 獲取票種列表成功
 */
router.get('/concerts/:concertId', ticketTypeController.getTicketTypesByConcert);

/**
 * @swagger
 * /api/ticket-types/{ticketTypeId}:
 *   get:
 *     summary: 獲取票種詳情
 *     tags: [TicketTypes]
 *     parameters:
 *       - in: path
 *         name: ticketTypeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 獲取票種詳情成功
 */
router.get('/:ticketTypeId', ticketTypeController.getTicketTypeById);

/**
 * @swagger
 * /api/ticket-types:
 *   post:
 *     summary: 創建票種（管理者用）
 *     tags: [TicketTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - concertId
 *               - ticketTypeName
 *               - ticketTypePrice
 *               - totalQuantity
 *             properties:
 *               concertId:
 *                 type: string
 *               ticketTypeName:
 *                 type: string
 *               description:
 *                 type: string
 *               entranceType:
 *                 type: string
 *               ticketBenefits:
 *                 type: string
 *               refundPolicy:
 *                 type: string
 *               ticketTypePrice:
 *                 type: number
 *               totalQuantity:
 *                 type: integer
 *               sellBeginDate:
 *                 type: string
 *                 format: date-time
 *               sellEndDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: 票種創建成功
 */
router.post('/', isAuthenticated, isAdmin, ticketTypeController.createTicketType);

/**
 * @swagger
 * /api/ticket-types/{ticketTypeId}:
 *   put:
 *     summary: 更新票種（管理者用）
 *     tags: [TicketTypes]
 *     parameters:
 *       - in: path
 *         name: ticketTypeId
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
 *               ticketTypeName:
 *                 type: string
 *               description:
 *                 type: string
 *               entranceType:
 *                 type: string
 *               ticketBenefits:
 *                 type: string
 *               refundPolicy:
 *                 type: string
 *               ticketTypePrice:
 *                 type: number
 *               totalQuantity:
 *                 type: integer
 *               sellBeginDate:
 *                 type: string
 *                 format: date-time
 *               sellEndDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: 票種更新成功
 */
router.put('/:ticketTypeId', isAuthenticated, isAdmin, ticketTypeController.updateTicketType);

/**
 * @swagger
 * /api/ticket-types/{ticketTypeId}:
 *   delete:
 *     summary: 刪除票種（管理者用）
 *     tags: [TicketTypes]
 *     parameters:
 *       - in: path
 *         name: ticketTypeId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 票種刪除成功
 */
router.delete('/:ticketTypeId', isAuthenticated, isAdmin, ticketTypeController.deleteTicketType);

export default router; 