import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'concert_ticket_booking',
  DB_USER = 'postgres',
  DB_PASSWORD,
} = process.env;

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
  },
});

export const connectToDatabase = async () => {
  try {
    // 首先嘗試創建資料庫（如果不存在）
    const pool = new Pool({
      user: DB_USER,
      host: DB_HOST,
      password: DB_PASSWORD,
      port: parseInt(DB_PORT, 10),
      database: 'postgres' // 連接到默認的 postgres 資料庫
    });

    // 檢查資料庫是否存在
    const checkDbResult = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`
    );

    // 如果資料庫不存在，則創建它
    if (checkDbResult.rows.length === 0) {
      console.log(`資料庫 ${DB_NAME} 不存在，正在創建...`);
      await pool.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`資料庫 ${DB_NAME} 創建成功`);
    }

    await pool.end();

    // 然後連接到資料庫
    await sequelize.authenticate();
    console.log('資料庫連接成功');
    
    // 根據環境變量決定是否重建表
    if (process.env.NODE_ENV === 'development') {
      if (process.env.RESET_DB === 'true') {
        await sequelize.sync({ force: true });
        console.log('資料庫表已強制重建');
      } else {
        await sequelize.sync({ alter: true });
        console.log('資料庫表已更新 (保留數據)');
      }
    }
  } catch (error) {
    console.error('資料庫連接失敗:', error);
    throw new Error('資料庫連接失敗');
  }
};

export default sequelize; 