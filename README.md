# 音樂會票務系統

使用 PostgreSQL 和 Express 構建的音樂會票務預訂系統。

## 功能

- 用戶註冊和認證
- 音樂會瀏覽和搜索
- 票務預訂和支付
- 管理員後台管理

## 技術棧

- **後端**：Node.js, Express, TypeScript
- **數據庫**：PostgreSQL, Sequelize ORM
- **認證**：JWT, Google OAuth
- **容器化**：Docker

## 使用 Docker 運行

本項目支持使用 Docker 進行開發和部署。這提供了一致的開發環境，並簡化了部署過程。

### 快速開始

1. 確保已安裝 [Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://docs.docker.com/compose/install/)

2. 複製環境變數範例文件：

   ```bash
   cp .env.docker.example .env.docker
   ```

3. 編輯 `.env.docker` 文件，設置必要的環境變數

4. 使用 Docker Compose 啟動應用：
   ```bash
   docker-compose up
   ```

更多詳情，請參閱 [Docker 使用指南](docker-guide.md)。

## 無需 Docker 的安裝

如果你不想使用 Docker，可以直接在本地安裝和運行：

1. 確保已安裝 Node.js (v18+) 和 PostgreSQL (v14+)

2. 創建 PostgreSQL 數據庫：

   ```bash
   createdb concert_ticket_booking
   ```

3. 安裝依賴：

   ```bash
   npm install
   ```

4. 設置環境變數：

   ```bash
   cp .env.example .env
   # 編輯 .env 文件設置必要的環境變數
   ```

5. 運行數據庫遷移：

   ```bash
   npx sequelize-cli db:migrate
   ```

6. 啟動應用：
   ```bash
   npm run dev
   ```

## 數據庫管理

### 使用 Sequelize CLI 管理數據庫

1. 創建遷移文件：

   ```bash
   npx sequelize-cli migration:generate --name create-users
   ```

2. 運行遷移：

   ```bash
   npx sequelize-cli db:migrate
   ```

3. 回滾遷移：

   ```bash
   npx sequelize-cli db:migrate:undo
   ```

4. 創建種子數據：

   ```bash
   npx sequelize-cli seed:generate --name demo-users
   ```

5. 運行種子：
   ```bash
   npx sequelize-cli db:seed:all
   ```

## API 文檔

啟動應用後，可以在以下地址訪問 Swagger API 文檔：

```
http://localhost:3000/api-docs
```
