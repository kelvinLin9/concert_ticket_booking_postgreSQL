import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import { verifyToken } from '../utils';
import { handleErrorAsync } from '../statusHandle/handleErrorAsync';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { AppError } from '../statusHandle/AppError';
import { Op } from 'sequelize';

// 生成 JWT
const generateToken = (payload: any) => {
  const { JWT_SECRET, JWT_EXPIRES_DAY } = process.env;
  if (!JWT_SECRET) {
    throw new Error('缺少 JWT_SECRET 環境變數');
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_DAY || '7d'
  } as SignOptions);
};

// 註冊新用戶
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, nickname } = req.body;

    // 檢查 email 是否已經被註冊
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      throw createHttpError(409, '此 Email 已經被註冊');
    }

    // 創建新用戶
    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
      nickname,
      role: 'user',
      isEmailVerified: false,
      oauthProviders: []
    });

    // 生成驗證碼
    const { token, code } = await newUser.createVerificationToken();

    // 發送驗證郵件
    await sendVerificationEmail(email, code);

    // 生成 JWT
    const jwtToken = generateToken({
      userId: newUser.id,
      role: newUser.role
    });

    res.status(201).json({
      status: 'success',
      message: '註冊成功，請檢查郵箱完成驗證',
      data: {
        token: jwtToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          nickname: newUser.nickname,
          isEmailVerified: newUser.isEmailVerified
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// 用戶登入
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createHttpError(400, 'Email 和密碼為必填欄位');
    }

    // 查找用戶
    const user = await User.findOne({
      where: { email },
      attributes: { include: ['password'] }
    });

    if (!user || !(await user.comparePassword(password))) {
      throw createHttpError(401, 'Email 或密碼不正確');
    }

    // 生成 JWT
    const token = generateToken({
      userId: user.id,
      role: user.role
    });

    // 移除敏感字段
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    };

    res.status(200).json({
      status: 'success',
      message: '登入成功',
      data: {
        token,
        user: userData
      }
    });
  } catch (err) {
    next(err);
  }
};

// 驗證電子郵件
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      throw createHttpError(400, '缺少必要參數');
    }

    // 查找用戶
    const user = await User.findOne({
      where: { 
        email,
        verificationToken: { [Op.ne]: null },
        verificationTokenExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw createHttpError(400, '驗證碼無效或已過期');
    }

    // 檢查驗證碼
    if (user.verificationToken !== code) {
      throw createHttpError(400, '驗證碼不正確');
    }

    // 更新用戶狀態
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email 驗證成功'
    });
  } catch (err) {
    next(err);
  }
};

// 重新發送驗證碼
export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createHttpError(400, '缺少 Email 參數');
    }

    // 查找用戶
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      throw createHttpError(404, '找不到使用者');
    }

    if (user.isEmailVerified) {
      throw createHttpError(400, '此 Email 已經驗證過了');
    }

    // 檢查是否在3分鐘內已經發送過驗證郵件
    const lastAttempt = user.lastVerificationAttempt;
    if (lastAttempt && new Date().getTime() - lastAttempt.getTime() < 3 * 60 * 1000) {
      const remainingSeconds = Math.ceil((3 * 60 * 1000 - (new Date().getTime() - lastAttempt.getTime())) / 1000);
      throw createHttpError(429, `請稍後再試，${remainingSeconds} 秒後可重新發送`);
    }

    // 生成新的驗證碼
    const { token, code } = await user.createVerificationToken();

    // 發送驗證郵件
    await sendVerificationEmail(email, code);

    res.status(200).json({
      status: 'success',
      message: '驗證郵件已發送，請檢查您的郵箱'
    });
  } catch (err) {
    next(err);
  }
};

// 請求密碼重置
export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createHttpError(400, '缺少 Email 參數');
    }

    // 查找用戶
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      throw createHttpError(404, '找不到使用者');
    }

    // 生成密碼重置碼
    const { token, code } = await user.createPasswordResetToken();

    // 發送密碼重置郵件
    await sendPasswordResetEmail(email, code);

    res.status(200).json({
      status: 'success',
      message: '密碼重置郵件已發送，請檢查您的郵箱'
    });
  } catch (err) {
    next(err);
  }
};

// 重置密碼
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      throw createHttpError(400, '缺少必要參數');
    }

    // 查找用戶
    const user = await User.findOne({
      where: { 
        email,
        passwordResetToken: { [Op.ne]: null },
        passwordResetExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw createHttpError(400, '重置碼無效或已過期');
    }

    // 檢查重置碼
    if (user.passwordResetToken !== code) {
      throw createHttpError(400, '重置碼不正確');
    }

    // 更新密碼
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: '密碼重置成功，請使用新密碼登入',
    });
  } catch (err) {
    next(err);
  }
}; 