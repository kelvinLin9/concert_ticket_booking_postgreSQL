import { Router } from 'express';
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getMyOrganizations
} from '../controller/organization';
import { authenticate } from '../middlewares/auth';
import { isAdmin } from '../middlewares/admin';
import { asyncHandler } from '../middlewares/async';

const router = Router();

// 獲取所有組織 (僅管理員可用)
router.get('/', authenticate, isAdmin, asyncHandler(getAllOrganizations));

// 獲取當前用戶所屬組織
router.get('/me', authenticate, asyncHandler(getMyOrganizations));

// 獲取特定組織
router.get('/:id', authenticate, asyncHandler(getOrganizationById));

// 創建組織
router.post('/', authenticate, asyncHandler(createOrganization));

// 更新組織
router.put('/:id', authenticate, asyncHandler(updateOrganization));

// 刪除組織
router.delete('/:id', authenticate, asyncHandler(deleteOrganization));

export default router; 