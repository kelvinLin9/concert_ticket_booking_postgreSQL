import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Order, Payment, TicketType, Ticket } from '../models';

/**
 * 創建支付請求
 */
export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { lockToken } = req.query;
    const { method, provider } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [{ model: TicketType }]
    });

    if (!order) {
      return res.status(404).json({ message: '訂單不存在' });
    }

    // 驗證鎖票token
    if (order.isLocked && order.lockToken !== lockToken) {
      return res.status(403).json({ message: '無權訪問此訂單' });
    }

    // 檢查訂單狀態
    if (order.orderStatus !== 'held') {
      return res.status(400).json({ message: `不能支付${order.orderStatus}狀態的訂單` });
    }

    // 檢查鎖票是否過期
    if (order.lockExpireTime < new Date()) {
      return res.status(400).json({ message: '訂單已過期，請重新下單' });
    }

    // 檢查必要的訂單資訊是否已填寫
    if (!order.purchaserName || !order.purchaserEmail || !order.purchaserPhone) {
      return res.status(400).json({ message: '請先完善訂單資訊' });
    }

    // 獲取票種價格
    const ticketPrice = order.ticketType.ticketTypePrice;

    // 創建支付記錄
    const payment = await Payment.create({
      paymentId: uuidv4(),
      orderId: order.orderId,
      method,
      provider,
      status: 'pending',
      amount: ticketPrice
    });

    // 這裡應該根據不同的支付方式處理不同的支付邏輯
    // 例如調用第三方支付API等
    // 簡化起見，這裡直接返回支付資訊

    return res.status(201).json({
      message: '支付請求創建成功',
      data: {
        paymentId: payment.paymentId,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        provider: payment.provider,
        // 這裡可以返回支付頁面URL或其他支付相關資訊
        paymentUrl: `https://example.com/pay/${payment.paymentId}`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 處理支付回調
 */
export const handlePaymentCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const payloadData = req.body;

    // 查找支付記錄
    const payment = await Payment.findByPk(paymentId, {
      include: [{ model: Order }]
    });

    if (!payment) {
      return res.status(404).json({ message: '支付記錄不存在' });
    }

    // 驗證回調資料的合法性（實際應用中需要做更嚴格的驗證）
    // 這裡只是簡化的示例

    // 更新支付狀態
    await payment.update({
      status: 'completed',
      paidAt: new Date(),
      transactionId: payloadData.transactionId || uuidv4(),
      rawPayload: payloadData
    });

    // 更新訂單狀態
    await payment.order.update({
      orderStatus: 'paid',
      isLocked: false
    });

    // 創建票券記錄
    const ticket = await Ticket.create({
      ticketId: uuidv4(),
      orderId: payment.order.orderId,
      ticketTypeId: payment.order.ticketTypeId,
      userId: payment.order.userId,
      purchaserName: payment.order.purchaserName,
      purchaserEmail: payment.order.purchaserEmail,
      status: 'purchased',
      qrCode: uuidv4(), // 實際應用中需要生成合適的QR碼
      purchaseTime: new Date()
    });

    // 如果是來自金流平台的回調，可能需要返回特定的格式
    if (req.headers['x-callback-source'] === 'payment-provider') {
      return res.status(200).send('OK');
    }

    return res.status(200).json({
      message: '支付成功',
      data: {
        ticketId: ticket.ticketId,
        orderId: payment.order.orderId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取支付詳情
 */
export const getPaymentDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByPk(paymentId, {
      include: [{ model: Order }]
    });

    if (!payment) {
      return res.status(404).json({ message: '支付記錄不存在' });
    }

    return res.status(200).json({
      message: '獲取支付詳情成功',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createPayment,
  handlePaymentCallback,
  getPaymentDetails
}; 