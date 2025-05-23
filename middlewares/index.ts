import createHttpError from 'http-errors';
import validator from 'validator';
import { verifyToken } from '../utils/index';
import { Request, Response, NextFunction } from 'express';

// 擴展 Request 類型，使用 any 類型避免類型檢查錯誤
export interface CustomRequest extends Omit<Request, 'user'> {
  user?: {
    userId: string;
    id: string; // 添加 id 屬性與 userId 保持一致
    role: string;
  };
  token?: string;
}

// token 驗證
export const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw createHttpError(401, '請先登入');
    }
    const decoded = verifyToken(token);
    if (!('userId' in decoded) || !('role' in decoded)) {
      throw createHttpError(401, '無效的 Token 格式');
    }
    
    // 設置 user 屬性，確保與 Express.User 接口兼容
    req.user = {
      id: decoded.userId,
      role: decoded.role as "user" | "admin" | "superuser"
    };
    
    console.log('req.user:', decoded);
    next();
  } catch (error) {
    next(createHttpError(401, '認證失敗：無效的 Token'));
  }
};

// 實作管理員權限（這部分需要後續完善）
export const isAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
  // 使用類型斷言處理類型不兼容問題
  isAuth(req as Request, res, async (err) => {
    if (err) {
      return next(err); // 如果認證中間件遇到錯誤，直接將錯誤傳遞下去
    }

    try {
      // 檢查 req.user 中是否有角色資訊並且角色是否為 'admin'
      if (!req.user) {
        throw createHttpError(401, '請先登入');
      }
      if (req.user.role !== 'admin') {
        throw createHttpError(403, '授權失敗：您不具備管理員權限');
      }
      next();
    } catch (error) {
      next(error);
    }
  });
};

export const checkRequestBodyValidator = (req: Request, _res: Response, next: NextFunction) => {
  try {
    for (let [key, value] of Object.entries(req.body)) {
      if (value === undefined || value === null) {
        throw new Error('欄位未填寫正確');
      }

      const _value = `${value}`;

      switch (key) {
        case 'name':
          if (!validator.isLength(_value, { min: 2 })) {
            throw new Error('name 至少 2 個字元以上');
          }
          break;
        case 'email':
          if (!validator.isEmail(_value)) {
            throw new Error('Email 格式不正確');
          }
          break;
        case 'password':
        case 'newPassword':
          if (!validator.isLength(_value, { min: 8 })) {
            throw new Error('密碼需至少 8 碼以上');
          }
          if (validator.isAlpha(_value)) {
            throw new Error('密碼不能只有英文');
          }
          if (validator.isNumeric(_value)) {
            throw new Error('密碼不能只有數字');
          }
          if (!validator.isAlphanumeric(_value)) {
            throw new Error('密碼需至少 8 碼以上，並英數混合');
          }
          break;
        case 'phone':
          if (_value && !validator.isMobilePhone(_value, 'zh-TW')) {
            throw new Error('電話格式不正確，請使用台灣手機號碼格式');
          }
          break;
        case 'birthday':
          if (_value && !validator.isISO8601(_value)) {
            throw new Error('生日格式不正確，請使用YYYY-MM-DD格式');
          }
          break;
        case 'image':
          if (!validator.isURL(_value, { protocols: ['https'] })) {
            throw new Error('image 格式不正確');
          }
          break;
        default:
          break;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
