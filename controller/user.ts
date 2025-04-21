import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import validator from 'validator';
import { User } from '../models';
import { generateToken, verifyToken } from '../utils/index';
import { handleErrorAsync } from '../statusHandle/handleErrorAsync';
import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';

interface CustomRequest extends Omit<Request, 'user'> {
  user?: {
    id: string;
    userId: string;
    role: string;
  };
}

const checkAuthStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw createHttpError(401, '請先登入');
    }
    const payload = verifyToken(token);
    if (!payload || !('role' in payload)) {
      throw createHttpError(403, '無訪問權限');
    }
    const customReq = req as CustomRequest;
    if (!customReq.user) {
      throw createHttpError(401, '請先登入');
    }

    // 直接返回 userId 和 role，不再查詢完整的用戶資料
    res.status(200).json({
      status: 'success',
      message: '',
      data: {
        userId: customReq.user.userId,
        role: customReq.user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
        status: 'failed',
        message: '找不到該使用者',
      });
    }

    res.status(200).json({
      status: 'success',
      message: '',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customReq = req as CustomRequest;
    if (!customReq.user) {
      throw createHttpError(401, '請先登入');
    }

    const userId = customReq.user.userId;
    const { 
      name,
      nickname, 
      email, 
      phone, 
      birthday, 
      gender, 
      country, 
      address, 
      avatar, 
      preferredRegions, 
      preferredEventTypes 
    } = req.body;

    const updatedFields: any = {};

    // 只更新有提供的欄位
    if (name !== undefined) updatedFields.name = name;
    if (nickname !== undefined) updatedFields.nickname = nickname;
    if (email !== undefined) updatedFields.email = email;
    if (phone !== undefined) updatedFields.phone = phone;
    if (birthday !== undefined) updatedFields.birthday = birthday;
    if (gender !== undefined) updatedFields.gender = gender;
    if (country !== undefined) updatedFields.country = country;
    if (address !== undefined) updatedFields.address = address;
    if (avatar !== undefined) updatedFields.avatar = avatar;
    if (preferredRegions !== undefined) updatedFields.preferredRegions = preferredRegions;
    if (preferredEventTypes !== undefined) updatedFields.preferredEventTypes = preferredEventTypes;

    // 使用Sequelize的update方法更新用戶
    const [numRowsUpdated, updatedUsers] = await User.update(
      updatedFields,
      {
        where: { id: userId },
        returning: true
      }
    );

    if (numRowsUpdated === 0) {
      return res.status(404).json({
        status: 'failed',
        message: '找不到該使用者'
      });
    }

    const updatedUser = updatedUsers[0];

    res.status(200).json({
      status: 'success',
      message: '成功修改用戶資料',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customReq = req as CustomRequest;
    
    // 分頁參數
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // 搜尋參數
    const search = req.query.search as string;
    const filterBy: any = {};

    if (search) {
      filterBy[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } },
        { nickname: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // 使用Sequelize查詢
    const users = await User.findAll({
      where: filterBy,
      limit,
      offset: skip,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    const total = await User.count({ where: filterBy });
    
    // 計算分頁資訊
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      message: '',
      data: {
        users
      },
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customReq = req as CustomRequest;
    
    // 確認是否為管理員
    if (customReq.user?.role !== 'admin' && customReq.user?.role !== 'superuser') {
      throw createHttpError(403, '權限不足');
    }
    
    const { id, role } = req.body;
    
    if (!id || !role) {
      throw createHttpError(400, '缺少必要資訊');
    }
    
    // 驗證角色
    if (!['user', 'admin'].includes(role)) {
      throw createHttpError(400, '無效的角色');
    }
    
    // 更新角色
    const [numUpdated] = await User.update(
      { role: role },
      { where: { id: customReq.user.userId } }
    );
    
    if (numUpdated === 0) {
      throw createHttpError(404, '找不到使用者');
    }
    
    const newUserDetails = await User.findByPk(customReq.user.userId);

    res.status(200).json({
      status: 'success',
      data: {
        user: newUserDetails
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customReq = req as CustomRequest;
    const userId = req.params.id;
    
    // 確認是否為管理員
    if (customReq.user?.role !== 'admin' && customReq.user?.role !== 'superuser') {
      throw createHttpError(403, '權限不足');
    }
    
    const { 
      name, 
      nickname, 
      email, 
      phone, 
      birthday, 
      gender, 
      country, 
      address, 
      avatar, 
      role,
      preferredRegions, 
      preferredEventTypes 
    } = req.body;

    const updatedFields: any = {};

    // 只更新有提供的欄位
    if (name !== undefined) updatedFields.name = name;
    if (nickname !== undefined) updatedFields.nickname = nickname;
    if (email !== undefined) updatedFields.email = email;
    if (phone !== undefined) updatedFields.phone = phone;
    if (birthday !== undefined) updatedFields.birthday = birthday;
    if (gender !== undefined) updatedFields.gender = gender;
    if (country !== undefined) updatedFields.country = country;
    if (address !== undefined) updatedFields.address = address;
    if (avatar !== undefined) updatedFields.avatar = avatar;
    if (role !== undefined) updatedFields.role = role;
    if (preferredRegions !== undefined) updatedFields.preferredRegions = preferredRegions;
    if (preferredEventTypes !== undefined) updatedFields.preferredEventTypes = preferredEventTypes;

    // 使用Sequelize的update方法
    const [numRowsUpdated, updatedUsers] = await User.update(
      updatedFields,
      {
        where: { id: userId },
        returning: true
      }
    );

    if (numRowsUpdated === 0) {
      return res.status(404).json({
        status: 'failed',
        message: '找不到該使用者'
      });
    }

    const updatedUser = updatedUsers[0];

    res.status(200).json({
      status: 'success',
      message: '',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customReq = req as CustomRequest;
    const userId = req.params.id;
    
    // 確認是否為管理員
    if (customReq.user?.role !== 'admin' && customReq.user?.role !== 'superuser') {
      throw createHttpError(403, '權限不足');
    }
    
    // 使用Sequelize的destroy方法刪除用戶
    const deletedRowCount = await User.destroy({
      where: { id: userId }
    });

    if (deletedRowCount === 0) {
      return res.status(404).json({
        status: 'failed',
        message: '找不到該使用者'
      });
    }

    res.status(200).json({
      status: 'success',
      message: '用戶已成功刪除'
    });
  } catch (err) {
    next(err);
  }
};

export {
  checkAuthStatus,
  getUser,
  getAllUsers,
  updateInfo,
  updateRole,
  updateUser,
  deleteUser,
};
