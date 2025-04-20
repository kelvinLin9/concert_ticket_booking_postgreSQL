import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Order, TicketType, Ticket, Payment } from '../models';
import { Op } from 'sequelize';

/**
 * 創建訂單（鎖票功能）
 * 
 * 鎖票流程：
 * 1. 檢查票種是否存在及數量是否足夠
 * 2. 創建訂單(狀態為held)
 * 3. 減少票種的剩餘數量
 * 4. 返回訂單ID和鎖票token
 */
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketTypeId, userId = null } = req.body;

    // 檢查票種是否存在且數量足夠
    const ticketType = await TicketType.findByPk(ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({ message: '票種不存在' });
    }

    if (ticketType.remainingQuantity <= 0) {
      return res.status(400).json({ message: '票券已售罄' });
    }

    const now = new Date();
    
    // 檢查是否在銷售期間
    if (ticketType.sellBeginDate && ticketType.sellBeginDate > now) {
      return res.status(400).json({ message: '尚未開始銷售' });
    }
    
    if (ticketType.sellEndDate && ticketType.sellEndDate < now) {
      return res.status(400).json({ message: '已結束銷售' });
    }

    // 設定鎖票過期時間（15分鐘）
    const lockExpireTime = new Date();
    lockExpireTime.setMinutes(lockExpireTime.getMinutes() + 15);

    // 創建訂單
    const order = await Order.create({
      orderId: uuidv4(),
      ticketTypeId,
      userId,
      orderStatus: 'held',
      isLocked: true,
      lockToken: uuidv4(),
      lockExpireTime
    });

    // 更新票種剩餘數量
    await ticketType.update({
      remainingQuantity: ticketType.remainingQuantity - 1
    });

    return res.status(201).json({
      message: '訂單創建成功',
      data: {
        orderId: order.orderId,
        lockToken: order.lockToken,
        lockExpireTime: order.lockExpireTime,
        ticketTypeInfo: {
          name: ticketType.ticketTypeName,
          price: ticketType.ticketTypePrice
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取訂單詳情
 */
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { lockToken } = req.query;

    const order = await Order.findByPk(orderId, {
      include: [
        { model: TicketType },
        { model: Ticket },
        { model: Payment }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: '訂單不存在' });
    }

    // 如果訂單處於鎖定狀態，需要驗證鎖票token
    if (order.isLocked && order.lockToken !== lockToken) {
      return res.status(403).json({ message: '無權訪問此訂單' });
    }

    return res.status(200).json({
      message: '獲取訂單成功',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新訂單資訊
 */
export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { lockToken } = req.query;
    const { purchaserName, purchaserEmail, purchaserPhone, invoiceType, invoiceCarrier } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: '訂單不存在' });
    }

    // 訂單狀態已完成或已取消，不允許更新
    if (['paid', 'cancelled', 'refunded'].includes(order.orderStatus)) {
      return res.status(400).json({ message: '訂單狀態不允許更新' });
    }

    // 驗證鎖票token
    if (order.isLocked && order.lockToken !== lockToken) {
      return res.status(403).json({ message: '無權更新此訂單' });
    }

    // 檢查鎖票是否過期
    if (order.lockExpireTime < new Date()) {
      return res.status(400).json({ message: '訂單已過期' });
    }

    // 更新訂單資訊
    await order.update({
      purchaserName,
      purchaserEmail,
      purchaserPhone,
      invoiceType,
      invoiceCarrier
    });

    return res.status(200).json({
      message: '訂單更新成功',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 取消訂單
 */
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { lockToken } = req.query;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: '訂單不存在' });
    }

    // 訂單狀態已完成或已取消，不允許取消
    if (['paid', 'cancelled', 'refunded'].includes(order.orderStatus)) {
      return res.status(400).json({ message: '訂單狀態不允許取消' });
    }

    // 驗證鎖票token
    if (order.isLocked && order.lockToken !== lockToken) {
      return res.status(403).json({ message: '無權取消此訂單' });
    }

    // 增加票種剩餘數量
    const ticketType = await TicketType.findByPk(order.ticketTypeId);
    if (ticketType) {
      await ticketType.update({
        remainingQuantity: ticketType.remainingQuantity + 1
      });
    }

    // 更新訂單狀態
    await order.update({
      orderStatus: 'cancelled',
      isLocked: false
    });

    return res.status(200).json({
      message: '訂單取消成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 處理過期訂單（系統定時任務使用）
 */
export const handleExpiredOrders = async () => {
  try {
    const now = new Date();

    // 查找所有已過期且狀態仍為held的訂單
    const expiredOrders = await Order.findAll({
      where: {
        orderStatus: 'held',
        lockExpireTime: {
          [Op.lt]: now
        }
      }
    });

    for (const order of expiredOrders) {
      // 更新訂單狀態
      await order.update({
        orderStatus: 'expired',
        isLocked: false
      });

      // 增加票種剩餘數量
      const ticketType = await TicketType.findByPk(order.ticketTypeId);
      if (ticketType) {
        await ticketType.update({
          remainingQuantity: ticketType.remainingQuantity + 1
        });
      }
    }

    return {
      processed: expiredOrders.length,
      message: `處理了 ${expiredOrders.length} 筆過期訂單`
    };
  } catch (error) {
    console.error('處理過期訂單失敗:', error);
    throw error;
  }
};

export default {
  createOrder,
  getOrderById,
  updateOrder,
  cancelOrder,
  handleExpiredOrders
}; 