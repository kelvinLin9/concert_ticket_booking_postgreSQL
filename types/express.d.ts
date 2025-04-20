import 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
      email: string;
      [key: string]: any;
    }
  }
} 