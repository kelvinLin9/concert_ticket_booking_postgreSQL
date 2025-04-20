import { Request, Response } from 'express';
import { Organization } from '../models/organization';
import { v4 as uuidv4 } from 'uuid';
import { CustomRequest } from '../middlewares';

// 擴展Express的Request介面，添加用戶屬性
declare module 'express' {
  interface User {
    id: string;
    role?: 'user' | 'admin' | 'superuser';
  }
  
  export interface Request {
    user?: User;
  }
}

// 定義錯誤類型（如果無法引入）
class AppError extends Error {
  status: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.status = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

class ServerError extends AppError {
  constructor(message: string) {
    super(message, 500);
  }
}

/**
 * 查詢所有組織
 */
export const getAllOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizations = await Organization.findAll();
    res.status(200).json({
      status: "success",
      message: "成功取得所有組織資料",
      data: organizations
    });
  } catch (error) {
    throw new ServerError('獲取組織列表失敗');
  }
};

/**
 * 根據ID查詢特定組織
 */
export const getOrganizationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organization = await Organization.findOne({
      where: { organizationId: id }
    });

    if (!organization) {
      throw new NotFoundError('找不到指定組織');
    }

    res.status(200).json({
      status: "success",
      message: "成功取得組織資料",
      data: organization
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new ServerError('獲取組織詳情失敗');
  }
};

/**
 * 創建新組織
 */
export const createOrganization = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ValidationError('用戶未認證');
    }

    const {
      orgName,
      orgAddress,
      orgMail,
      orgContact,
      orgMobile,
      orgPhone,
      orgWebsite
    } = req.body;

    if (!orgName || !orgAddress) {
      throw new ValidationError('公司名稱和地址為必填欄位');
    }

    const newOrganization = await Organization.create({
      organizationId: uuidv4(),
      userId,
      orgName,
      orgAddress,
      orgMail,
      orgContact,
      orgMobile,
      orgPhone,
      orgWebsite,
      status: 'active',
      verificationStatus: 'unverified'
    });

    res.status(201).json({
      status: "success",
      message: "成功創建組織",
      data: newOrganization
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ServerError('創建組織失敗');
  }
};

/**
 * 更新組織資訊
 */
export const updateOrganization = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ValidationError('用戶未認證');
    }

    const organization = await Organization.findOne({
      where: { organizationId: id }
    });

    if (!organization) {
      throw new NotFoundError('找不到指定組織');
    }

    // 檢查是否為組織所有者或管理員
    if (organization.userId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'superuser') {
      throw new ValidationError('無權修改此組織');
    }

    const {
      orgName,
      orgAddress,
      orgMail,
      orgContact,
      orgMobile,
      orgPhone,
      orgWebsite,
      status,
      verificationStatus
    } = req.body;

    // 只有管理員可更新狀態
    let updateData: any = {
      orgName,
      orgAddress,
      orgMail,
      orgContact,
      orgMobile,
      orgPhone,
      orgWebsite
    };

    if (req.user?.role === 'admin' || req.user?.role === 'superuser') {
      updateData.status = status;
      updateData.verificationStatus = verificationStatus;
    }

    await organization.update(updateData);

    const updatedOrganization = await Organization.findOne({
      where: { organizationId: id }
    });

    res.status(200).json({
      status: "success",
      message: "成功更新組織資料",
      data: updatedOrganization
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new ServerError('更新組織失敗');
  }
};

/**
 * 刪除組織
 */
export const deleteOrganization = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ValidationError('用戶未認證');
    }

    const organization = await Organization.findOne({
      where: { organizationId: id }
    });

    if (!organization) {
      throw new NotFoundError('找不到指定組織');
    }

    // 檢查是否為組織所有者或管理員
    if (organization.userId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'superuser') {
      throw new ValidationError('無權刪除此組織');
    }

    await organization.destroy();

    res.status(200).json({
      status: "success",
      message: "成功刪除組織",
      data: null
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new ServerError('刪除組織失敗');
  }
};

/**
 * 獲取用戶所屬的所有組織
 */
export const getMyOrganizations = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ValidationError('用戶未認證');
    }

    const organizations = await Organization.findAll({
      where: { userId }
    });

    res.status(200).json({
      status: "success",
      message: "成功取得用戶所屬組織資料",
      data: organizations
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ServerError('獲取用戶組織列表失敗');
  }
}; 