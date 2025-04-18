import { Router } from 'express';
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getMyOrganizations
} from '../controller/organization';
import { isAuth, isAdmin } from '../middlewares';

// 創建異步處理器，使用any忽略類型檢查
// @ts-ignore: 忽略類型檢查以解決Express類型不兼容問題
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();

// 獲取所有組織 (僅管理員可用)
// @ts-ignore
router.get('/', isAuth, isAdmin, asyncHandler(getAllOrganizations));

// 獲取當前用戶所屬組織
// @ts-ignore
router.get('/me', isAuth, asyncHandler(getMyOrganizations));

// 獲取特定組織
// @ts-ignore
router.get('/:id', isAuth, asyncHandler(getOrganizationById));

// 創建組織
// @ts-ignore
router.post('/', isAuth, asyncHandler(createOrganization));

// 更新組織
// @ts-ignore
router.put('/:id', isAuth, asyncHandler(updateOrganization));

// 刪除組織
// @ts-ignore
router.delete('/:id', isAuth, asyncHandler(deleteOrganization));

export default router; 