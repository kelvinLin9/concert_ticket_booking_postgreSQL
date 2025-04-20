import { Request, Response, NextFunction } from 'express';
import { Ticket, Order, TicketType } from '../models';

/**
 * 獲取用戶的所有票券
 */
export const getUserTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '請先登入' });
    }

    const tickets = await Ticket.findAll({
      where: { userId },
      include: [
        { 
          model: TicketType,
          attributes: ['ticketTypeId', 'ticketTypeName', 'description', 'ticketTypePrice']
        },
        {
          model: Order,
          attributes: ['orderId', 'orderStatus', 'purchaserName', 'purchaserEmail']
        }
      ],
      order: [['purchaseTime', 'DESC']]
    });

    return res.status(200).json({
      message: '獲取票券列表成功',
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取票券詳情
 */
export const getTicketById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user?.id;

    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        { 
          model: TicketType,
          attributes: ['ticketTypeId', 'ticketTypeName', 'description', 'ticketTypePrice', 
                      'entranceType', 'ticketBenefits', 'refundPolicy']
        },
        {
          model: Order,
          attributes: ['orderId', 'orderStatus', 'purchaserName', 'purchaserEmail', 'purchaserPhone']
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ message: '票券不存在' });
    }

    // 如果票券有關聯用戶，且當前用戶不是票券持有人，返回錯誤
    if (ticket.userId && ticket.userId !== userId) {
      return res.status(403).json({ message: '無權訪問此票券' });
    }

    return res.status(200).json({
      message: '獲取票券詳情成功',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 驗證票券（主辦方使用）
 */
export const verifyTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketId } = req.params;
    const { qrCode } = req.body;

    const ticket = await Ticket.findByPk(ticketId, {
      include: [{ model: TicketType }]
    });

    if (!ticket) {
      return res.status(404).json({ message: '票券不存在' });
    }

    // 驗證QR碼
    if (ticket.qrCode !== qrCode) {
      return res.status(400).json({ message: 'QR碼驗證失敗' });
    }

    // 檢查票券狀態
    if (ticket.status !== 'purchased') {
      return res.status(400).json({ 
        message: `票券已${ticket.status === 'used' ? '使用' : '退款'}，不可再次使用` 
      });
    }

    // 更新票券狀態為已使用
    await ticket.update({ status: 'used' });

    return res.status(200).json({
      message: '票券驗證成功',
      data: {
        ticketId: ticket.ticketId,
        ticketTypeName: ticket.ticketType.ticketTypeName,
        purchaserName: ticket.purchaserName,
        status: ticket.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新票券（轉讓、重新生成QR碼等）
 */
export const updateTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user?.id;
    const { newUserId, regenerateQR } = req.body;

    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: '票券不存在' });
    }

    // 檢查是否為票券持有人
    if (ticket.userId !== userId) {
      return res.status(403).json({ message: '無權更新此票券' });
    }

    // 檢查票券狀態
    if (ticket.status !== 'purchased') {
      return res.status(400).json({ 
        message: `票券已${ticket.status === 'used' ? '使用' : '退款'}，不可更新` 
      });
    }

    const updateData: Partial<Ticket> = {};

    // 處理票券轉讓
    if (newUserId) {
      updateData.userId = newUserId;
    }

    // 處理重新生成QR碼
    if (regenerateQR) {
      // 實際應用中應該有更複雜的QR碼生成邏輯
      const newQRCode = `${ticket.ticketId}-${Date.now()}`;
      updateData.qrCode = newQRCode;
    }

    // 更新票券
    if (Object.keys(updateData).length > 0) {
      await ticket.update(updateData);
    }

    return res.status(200).json({
      message: '票券更新成功',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getUserTickets,
  getTicketById,
  verifyTicket,
  updateTicket
}; 