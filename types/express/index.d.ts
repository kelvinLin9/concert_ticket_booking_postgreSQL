import * as express from 'express';

declare global {
  namespace Express {
    interface User {
      id?: string;
      userId?: string;
      role?: string;
    }
  }
}

// 這會擴展現有的類型
export { }; 