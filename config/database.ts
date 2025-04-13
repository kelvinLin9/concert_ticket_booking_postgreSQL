/**
 * 資料庫配置文件
 * 
 * 當前使用: Sequelize ORM (https://sequelize.org/)
 * 
 * 未來計劃遷移到: TypeORM (https://typeorm.io/)
 * TypeORM 優勢:
 * - 原生 TypeScript 支持，類型定義更完善
 * - 基於裝飾器的實體定義，更符合物件導向設計
 * - 更強大的關聯映射和查詢能力
 * - 遷移系統更加靈活
 * 
 * 注意: 遷移過程需要重寫下列內容:
 * 1. 所有模型定義 (Entity 代替 Model, @Column 語法不同)
 * 2. 資料庫連接設定 (createConnection 代替 new Sequelize)
 * 3. 所有查詢邏輯 (Repository 模式代替 Model 靜態方法)
 * 4. 遷移工具使用 (TypeORM CLI 代替 Sequelize CLI)
 */

import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

// 根據環境選擇連接配置
let sequelize: Sequelize;

/**
 * 資料庫連接配置
 * 
 * 1. 生產環境: 使用 DATABASE_URL 環境變數 (通常由 Render 或其他平台提供)
 * 2. 開發環境: 使用個別的連接參數 (主機、端口、用戶名等)
 * 
 * TypeORM 等效配置將使用 createConnection() 函數，
 * 並使用 DataSource 來定義連接配置
 */

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
    logging: false, // 關閉 SQL 查詢日誌輸出，減少日誌雜訊
    define: {
      timestamps: true, // 自動添加 createdAt 和 updatedAt 欄位
      underscored: false, // 使用駝峰命名法而非下劃線命名法
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
    dialect: 'postgres', // 資料庫類型
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    logging: false, // 禁用 SQL 查詢日誌
    define: {
      timestamps: true, // 自動管理時間戳記欄位
      underscored: false, // 不使用下劃線命名
    },
  });
}

/**
 * 連接資料庫並進行初始設定
 * 
 * 功能:
 * 1. 檢查並創建資料庫 (僅開發環境)
 * 2. 建立連接並驗證
 * 3. 根據配置同步模型結構到資料庫
 * 
 * TypeORM 等效操作將使用:
 * - AppDataSource.initialize() 建立連接
 * - 使用遷移系統而非自動同步
 */
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
        database: 'postgres' // 連接到默認資料庫以建立新資料庫
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
        await sequelize.sync({ force: true }); // 強制重建所有表，刪除現有資料
        console.log('資料庫表已強制重建');
      } else {
        await sequelize.sync({ alter: true }); // 智能更新表結構，保留資料
        console.log('資料庫表已更新 (保留數據)');
      }
    } else if (process.env.NODE_ENV === 'production') {
      // 在生產環境中執行一次同步，以確保所有表都存在
      await sequelize.sync();
      console.log('生產環境: 資料庫表已同步');
    }
  } catch (error) {
    console.error('資料庫連接失敗:', error);
    throw new Error('資料庫連接失敗');
  }
};

export default sequelize; 