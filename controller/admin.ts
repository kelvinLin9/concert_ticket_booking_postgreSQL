import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { handleErrorAsync } from '../statusHandle/handleErrorAsync';
import { User } from '../models';
import { Op } from 'sequelize';

interface CustomRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// 檢查是否為管理員或超級用戶
const isAdminOrSuperuser = (role: string): boolean => {
  return role === 'admin' || role === 'superuser';
};

// 管理員專用：取得所有用戶資料
const getUsers = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
  const customReq = req as CustomRequest;
  if (!customReq.user || !isAdminOrSuperuser(customReq.user.role)) {
    throw createHttpError(403, '無權限訪問');
  }

  // 分頁參數
  const page = parseInt(String(req.query.page || '1'));
  const limit = parseInt(String(req.query.limit || '10'));
  const offset = (page - 1) * limit;

  // 排序參數
  const sortBy = String(req.query.sortBy || 'createdAt');
  const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';

  // 篩選參數
  const whereClause: any = {};
  
  // 搜尋條件
  if (req.query.search) {
    const searchTerm = String(req.query.search);
    whereClause[Op.or] = [
      { email: { [Op.iLike]: `%${searchTerm}%` } },
      { phone: { [Op.iLike]: `%${searchTerm}%` } },
      { country: { [Op.iLike]: `%${searchTerm}%` } }
    ];
  }

  // 角色篩選
  if (req.query.role) {
    whereClause.role = req.query.role;
  }

  // 郵件驗證狀態篩選
  if (req.query.isEmailVerified) {
    whereClause.isEmailVerified = req.query.isEmailVerified === 'true';
  }

  // 日期範圍篩選
  if (req.query.startDate || req.query.endDate) {
    whereClause.createdAt = {};
    if (req.query.startDate) {
      whereClause.createdAt[Op.gte] = new Date(String(req.query.startDate));
    }
    if (req.query.endDate) {
      whereClause.createdAt[Op.lte] = new Date(String(req.query.endDate));
    }
  }

  // 執行查詢
  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    attributes: { 
      exclude: ['password', 'verificationToken', 'verificationTokenExpires', 
               'passwordResetToken', 'passwordResetExpires', 'lastVerificationAttempt'] 
    },
    order: [[sortBy, sortOrder]],
    offset,
    limit
  });

  // 計算總頁數
  const totalPages = Math.ceil(count / limit);

  res.json({
    status: 'success',
    message: '',
    data: {
      users,
      pagination: {
        total: count,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// 管理員專用：更新用戶資料
const updateUser = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
  const customReq = req as CustomRequest;
  if (!customReq.user || !isAdminOrSuperuser(customReq.user.role)) {
    throw createHttpError(403, '無權限訪問');
  }

  const userId = req.params.id;
  const updateData = req.body;

  // 移除不允許更新的欄位
  delete updateData.password;
  delete updateData.verificationToken;
  delete updateData.verificationTokenExpires;
  delete updateData.passwordResetToken;
  delete updateData.passwordResetExpires;
  delete updateData.lastVerificationAttempt;

  // 查找並更新用戶
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw createHttpError(404, '找不到用戶資料');
  }
  
  await user.update(updateData);
  
  // 重新獲取更新後的用戶，排除敏感字段
  const updatedUser = await User.findByPk(userId, {
    attributes: { 
      exclude: ['password', 'verificationToken', 'verificationTokenExpires', 
               'passwordResetToken', 'passwordResetExpires', 'lastVerificationAttempt'] 
    }
  });

  res.json({
    status: 'success',
    message: '',
    data: {
      user: updatedUser
    }
  });
});

// 管理員專用：刪除用戶
const deleteUser = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
  const customReq = req as CustomRequest;
  if (!customReq.user || !isAdminOrSuperuser(customReq.user.role)) {
    throw createHttpError(403, '無權限訪問');
  }

  const userId = req.params.id;
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw createHttpError(404, '找不到用戶資料');
  }
  
  await user.destroy();

  res.json({
    status: 'success',
    message: '用戶已刪除'
  });
});

export {
  getUsers,
  updateUser,
  deleteUser
}; 