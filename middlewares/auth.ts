import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from './index';

interface JwtPayload {
  id: string;
}

// 自定義用於模型的類型
interface UserModel {
  id: string;
  role: string;
  email: string;
  [key: string]: any;
}

/**
 * 驗證用戶是否已登入的中間件
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 獲取Authorization頭
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'failed',
        message: '未提供認證令牌',
      });
    }

    // 獲取令牌
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'failed',
        message: '未提供認證令牌',
      });
    }

    // 驗證令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as jwt.JwtPayload;
    if (!decoded.id) {
      return res.status(401).json({
        status: 'failed',
        message: '無效的認證令牌',
      });
    }

    // 查找用戶
    const user = await User.findByPk(decoded.id) as unknown as UserModel;
    if (!user) {
      return res.status(401).json({
        status: 'failed',
        message: '用戶不存在',
      });
    }

    // 在請求對象中設置用戶信息（使用 any 類型暫時繞過類型檢查）
    (req as any).user = {
      id: user.id,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        status: 'failed',
        message: '無效的認證令牌',
      });
    }
    next(error);
  }
};

/**
 * 可選的身份驗證中間件
 * 如果提供了令牌則驗證，未提供則跳過但不阻止請求
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 獲取Authorization頭
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    // 獲取令牌
    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    // 驗證令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as jwt.JwtPayload;
    if (!decoded.id) {
      return next();
    }

    // 查找用戶
    const user = await User.findByPk(decoded.id) as unknown as UserModel;
    if (!user) {
      return next();
    }

    // 在請求對象中設置用戶信息（使用 any 類型暫時繞過類型檢查）
    (req as any).user = {
      id: user.id,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    // 對於可選驗證，忽略令牌錯誤
    next();
  }
};

/**
 * 驗證用戶是否為管理員的中間件
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'failed',
      message: '請先登入',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'failed',
      message: '需要管理員權限',
    });
  }

  next();
};

/**
 * 驗證組織管理者權限的中間件
 */
export const isOrganizer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'failed',
      message: '請先登入',
    });
  }

  // 使用 as string 轉換類型，解決比較問題
  const role = req.user.role as string;
  if (role !== 'admin' && role !== 'organizer') {
    return res.status(403).json({
      status: 'failed',
      message: '需要組織管理員權限',
    });
  }

  next();
};

export const adminAuth = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await isAuthenticated(req as Request, res, () => {
      if (req.user && (req.user.role !== 'admin' && req.user.role !== 'superuser')) {
        return res.status(403).json({ 
          status: 'failed',
          message: '權限不足',
        });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ 
      status: 'failed',
      message: '認證失敗',
    });
  }
};

export const teacherAuth = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await isAuthenticated(req as Request, res, () => {
      if (req.user) {
        // 使用 as string 轉換類型，解決比較問題
        const role = req.user.role as string;
        if (role !== 'teacher' && role !== 'admin' && role !== 'superuser') {
          return res.status(403).json({ 
            status: 'failed',
            message: '權限不足',
          });
        }
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ 
      status: 'failed',
      message: '認證失敗',
    });
  }
}; 