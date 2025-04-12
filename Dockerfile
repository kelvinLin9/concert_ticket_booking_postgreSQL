FROM node:18-alpine

WORKDIR /app

# 設置環境變數
ENV NODE_ENV=production

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴但禁用 postinstall 腳本
RUN npm install --ignore-scripts

# 安裝 TypeScript
RUN npm install -D typescript

# 複製 tsconfig.json 和其他配置文件
COPY tsconfig.json ./

# 複製源代碼
COPY . .

# 使用 npx 運行 tsc 編譯
RUN npx tsc

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["node", "dist/bin/server.js"]