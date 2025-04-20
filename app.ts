import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// 另外裝的
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';
import { connectToDatabase } from './config/database';

// 確保模型初始化
import './models';

// 引入路由
import authRouter from './routes/auth';
import userRouter from './routes/users';
import verifyRouter from './routes/verify';
import adminRouter from './routes/admin';
import organizationRouter from './routes/organization';
import orderRouter from './routes/order';
import paymentRouter from './routes/payment';
import ticketRouter from './routes/ticket';
import ticketTypeRouter from './routes/ticketType';

const app = express();

// 未捕獲的異常處理
process.on('uncaughtException', (err) => {
  console.error('未捕獲的異常:', err);
  process.exit(1);
});

// 未處理的 Promise 拒絕處理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise 拒絕:', promise, '原因:', reason);
});

// 資料庫連接
connectToDatabase()
  .then(() => console.log("資料庫連接成功"))
  .catch(err => console.log("資料庫連接失敗:", err));

// 中間件設置
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 路由設置
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/verify', verifyRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/organizations', organizationRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/ticket', ticketRouter);
app.use('/api/v1/ticket-types', ticketTypeRouter);

// 註冊錯誤處理中間件 - 暫時使用簡化版本避免類型問題
app.use((err: any, req: any, res: any, next: any) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: 'failed',
    message: err.message || '系統發生錯誤',
  });
});

// 註冊 404 處理中間件 - 暫時使用簡化版本避免類型問題
app.use((req: any, res: any) => {
  res.status(404).json({
    status: 'failed',
    message: '找不到該資源',
  });
});

// view engine setup 之後研究
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

export default app;
