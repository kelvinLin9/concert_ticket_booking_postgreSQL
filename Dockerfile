FROM node:18-alpine

WORKDIR /app

# 設置環境變數
ENV NODE_ENV=production

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝所有依賴（包括 devDependencies）但忽略所有腳本
RUN npm install --ignore-scripts

# 複製 tsconfig.json 和其他配置文件
COPY tsconfig.json ./

# 複製源代碼
COPY . .

# 現在運行構建腳本（tsc 應該已從 devDependencies 安裝）
RUN npm run build

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["node", "dist/bin/server.js"] 