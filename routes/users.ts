import express from 'express';
import {
  getUser,
  updateInfo,
  updateRole,
} from '../controller/user';
import { checkRequestBodyValidator, isAuth } from '../middlewares/index';
import { handleErrorAsync } from '../statusHandle/handleErrorAsync';
import { Request, Response } from 'express';
import { CustomRequest } from '../middlewares';
import { User } from '../models';
import createHttpError from 'http-errors';

const router = express.Router();

// 取得當前用戶資料
router.get('/profile', isAuth, handleErrorAsync(async (req: Request, res: Response) => {
  const customReq = req as CustomRequest;
  if (!customReq.user) {
    throw createHttpError(401, '請先登入');
  }

  const user = await User.findByPk(customReq.user.userId, {
    attributes: { 
      exclude: ['password', 'verificationToken', 'verificationTokenExpires', 
               'passwordResetToken', 'passwordResetExpires', 'lastVerificationAttempt'] 
    }
  });

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: '找不到用戶資料'
    });
  }

  res.json({
    status: 'success',
    user
  });
}));

// 更新使用者資訊
router.put('/profile', isAuth, checkRequestBodyValidator, handleErrorAsync(updateInfo));

// 更新角色
router.put('/update-role', isAuth, updateRole);

export default router;