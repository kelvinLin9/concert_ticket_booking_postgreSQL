import 'express';

declare global {
  namespace Express {
    interface User {
      id?: string;
      userId?: string;
      role?: string | 'user' | 'admin' | 'superuser' | 'organizer';
      email?: string;
      [key: string]: any;
    }
  }
}

export {}; 