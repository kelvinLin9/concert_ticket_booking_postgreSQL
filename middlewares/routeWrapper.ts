import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from './index';

/**
 * 路由處理器包裝函數，用於處理 TypeScript 類型問題
 * 
 * @param handler 路由處理函數
 * @returns 包裝後的路由處理函數
 */
export const routeHandler = (
  handler: (req: Request | CustomRequest, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 將原始處理器包裝在 Promise 中以捕獲異常
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

/**
 * 路由中間件包裝函數，用於解決認證中間件的類型問題
 * 
 * @param middleware 認證中間件函數
 * @returns 包裝後的中間件函數
 */
export const authMiddleware = (
  middleware: (req: Request | CustomRequest, res: Response, next: NextFunction) => Promise<void> | void
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = middleware(req, res, next);
      if (result instanceof Promise) {
        result.catch(next);
      }
    } catch (error) {
      next(error);
    }
  };
};

export default { routeHandler, authMiddleware }; 