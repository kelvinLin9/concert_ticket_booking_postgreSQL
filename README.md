# Tickeasy 音樂會票務系統

使用 PostgreSQL 和 Express 構建的現代化音樂會票務預訂系統。

[線上演示](https://tickeasy.onrender.com)

## 功能

- 用戶註冊和身份驗證 (JWT、Google OAuth)
- 音樂會瀏覽和進階搜索
- 票務預訂和金流整合
- 個人票券管理
- 管理員後台完整管理功能

## 技術棧

- **後端**：Node.js, Express, TypeScript
- **資料庫**：PostgreSQL, Sequelize ORM
- **認證**：JWT, Google OAuth 2.0
- **容器化**：Docker, Docker Compose
- **雲端部署**：Render

## 使用 Docker 運行開發環境

本專案完整支援使用 Docker 進行開發和部署，提供一致性的開發體驗。

### 快速開始 (Docker)

1. 確保已安裝 [Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://docs.docker.com/compose/install/)

2. 複製環境變數範例文件（或使用現有的 .env）：

   ```bash
   cp .env.docker.example .env
   ```

3. 使用 Docker Compose 啟動應用：

   ```bash
   docker-compose up
   ```

4. 服務將在以下位置啟動：
   - 應用 API: http://localhost:3000
   - PostgreSQL 資料庫: localhost:5433 (注意：資料庫埠號映射為 5433，避免與本機 PostgreSQL 衝突)

### Docker 環境說明

- **應用容器**：基於 Node.js 18，設定在 `Dockerfile.dev`
- **資料庫容器**：PostgreSQL 16
- **持久化資料**：資料庫資料存儲在名為 `postgres_data` 的 Docker volume 中

詳細 Docker 配置可查看專案中的 `docker-compose.yml` 文件。

## 本機直接安裝 (無 Docker)

若不使用 Docker，可直接在本機安裝必要環境：

1. 確保已安裝 Node.js (v18+) 和 PostgreSQL (v16+)

2. 安裝專案依賴：

   ```bash
   npm install
   ```

3. 設置環境變數：

   ```bash
   cp .env.example .env
   # 編輯 .env 文件設置必要的環境變數
   ```

4. 啟動開發模式：
   ```bash
   npm run dev
   ```

## 資料庫管理

### 資料庫自動同步

系統在開發環境中會自動同步資料表結構 (`sequelize.sync({ alter: true }`)。可透過環境變數控制行為：

- `RESET_DB=true` - 強制重建所有資料表 (將清除所有資料)

### 使用 Sequelize CLI 管理資料庫 (推薦用於生產環境)

在生產環境中，建議使用遷移功能管理資料庫結構：

1. 安裝 Sequelize CLI：

   ```bash
   npm install --save-dev sequelize-cli
   ```

2. 創建遷移文件：

   ```bash
   npx sequelize-cli migration:generate --name add-new-field
   ```

3. 執行遷移：

   ```bash
   npx sequelize-cli db:migrate
   ```

4. 回滾遷移：

   ```bash
   npx sequelize-cli db:migrate:undo
   ```

## 雲端部署指南

本專案已配置為可在 Render 平台上部署。

### Render 部署步驟

1. 在 [Render](https://render.com) 建立帳號並登入

2. 建立 PostgreSQL 資料庫服務：

   - 選擇「New」→「PostgreSQL」
   - 設定名稱、地區和計劃

3. 建立 Web 服務：

   - 選擇「New」→「Web Service」
   - 連接 GitHub/GitLab 儲存庫
   - 配置以下設定：
     - 建置命令：`npm install && npm run build`
     - 啟動命令：`npm start`

4. 設定環境變數：
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = [Render 提供的 Internal Database URL]
   - `JWT_SECRET` = [您的密鑰]
   - `JWT_EXPIRES_DAY` = `7d`
   - 其他必要的環境變數（郵件設定、OAuth 等）

應用程式將自動同步資料庫結構並啟動服務。

## API 文檔

API 文檔使用 Swagger 提供，可在開發環境中訪問：

```
http://localhost:3000/api-docs
```

## 開發團隊

- [您的名字] - 主要開發者

## 授權

本專案採用 MIT 授權協議。
