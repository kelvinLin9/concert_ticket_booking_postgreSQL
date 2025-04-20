import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TicketType, Concert, Order } from '../models';

/**
 * 獲取演唱會的所有票種
 */
export const getTicketTypesByConcert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { concertId } = req.params;

    const ticketTypes = await TicketType.findAll({
      where: { concertId },
      order: [['ticketTypePrice', 'ASC']]
    });

    return res.status(200).json({
      message: '獲取票種列表成功',
      data: ticketTypes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取票種詳情
 */
export const getTicketTypeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketTypeId } = req.params;

    const ticketType = await TicketType.findByPk(ticketTypeId, {
      include: [{ model: Concert }]
    });

    if (!ticketType) {
      return res.status(404).json({ message: '票種不存在' });
    }

    return res.status(200).json({
      message: '獲取票種詳情成功',
      data: ticketType
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 創建票種（管理者用）
 */
export const createTicketType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      concertId,
      ticketTypeName,
      description,
      entranceType,
      ticketBenefits,
      refundPolicy,
      ticketTypePrice,
      totalQuantity,
      sellBeginDate,
      sellEndDate
    } = req.body;

    // 檢查演唱會是否存在
    const concert = await Concert.findByPk(concertId);
    if (!concert) {
      return res.status(404).json({ message: '演唱會不存在' });
    }

    // 創建新票種
    const ticketType = await TicketType.create({
      ticketTypeId: uuidv4(),
      concertId,
      ticketTypeName,
      description,
      entranceType,
      ticketBenefits,
      refundPolicy,
      ticketTypePrice,
      totalQuantity,
      remainingQuantity: totalQuantity,
      sellBeginDate,
      sellEndDate
    });

    return res.status(201).json({
      message: '票種創建成功',
      data: ticketType
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新票種（管理者用）
 */
export const updateTicketType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketTypeId } = req.params;
    const {
      ticketTypeName,
      description,
      entranceType,
      ticketBenefits,
      refundPolicy,
      ticketTypePrice,
      totalQuantity,
      sellBeginDate,
      sellEndDate
    } = req.body;

    const ticketType = await TicketType.findByPk(ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({ message: '票種不存在' });
    }

    // 如果總數量有變化，也同步更新剩餘數量
    let remainingQuantity;
    if (totalQuantity !== undefined && totalQuantity !== ticketType.totalQuantity) {
      const sold = ticketType.totalQuantity - ticketType.remainingQuantity;
      remainingQuantity = Math.max(0, totalQuantity - sold);
    }

    // 更新票種
    await ticketType.update({
      ticketTypeName,
      description,
      entranceType,
      ticketBenefits,
      refundPolicy,
      ticketTypePrice,
      totalQuantity,
      remainingQuantity,
      sellBeginDate,
      sellEndDate
    });

    return res.status(200).json({
      message: '票種更新成功',
      data: ticketType
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 刪除票種（管理者用）
 */
export const deleteTicketType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketTypeId } = req.params;

    const ticketType = await TicketType.findByPk(ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({ message: '票種不存在' });
    }

    // 檢查是否有與票種相關的訂單
    const ordersCount = await Order.count({
      where: { ticketTypeId }
    });
    
    if (ordersCount > 0) {
      return res.status(400).json({ 
        message: '該票種已有訂單關聯，無法刪除',
        data: { ordersCount }
      });
    }

    // 刪除票種
    await ticketType.destroy();

    return res.status(200).json({
      message: '票種刪除成功'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTicketTypesByConcert,
  getTicketTypeById,
  createTicketType,
  updateTicketType,
  deleteTicketType
}; 