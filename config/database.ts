import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

// 根據環境選擇連接配置
let sequelize: Sequelize;

// 優先檢查 DATABASE_URL（Render 提供的連接字串）
if (process.env.DATABASE_URL) {
  console.log('使用 DATABASE_URL 連接資料庫...');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // 在某些情況下可能需要此設定
      }
    },
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
    },
  });
} else {
  // 本地開發環境設定
  const {
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_NAME = 'concert_ticket_booking',
    DB_USER = 'postgres',
    DB_PASSWORD,
  } = process.env;

  sequelize = new Sequelize({
    dialect: 'postgres',
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
    },
  });
}

export const connectToDatabase = async () => {
  try {
    // 如果是使用 DATABASE_URL（生產環境）則跳過創建資料庫步驟
    if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
      const {
        DB_HOST = 'localhost',
        DB_PORT = '5432',
        DB_NAME = 'concert_ticket_booking',
        DB_USER = 'postgres',
        DB_PASSWORD,
      } = process.env;
      
      // 本地開發環境才嘗試創建資料庫
      const pool = new Pool({
        user: DB_USER,
        host: DB_HOST,
        password: DB_PASSWORD,
        port: parseInt(DB_PORT, 10),
        database: 'postgres'
      });

      try {
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
      } catch (err) {
        console.error('檢查/創建資料庫時出錯:', err);
      } finally {
        await pool.end();
      }
    }

    // 連接到資料庫
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