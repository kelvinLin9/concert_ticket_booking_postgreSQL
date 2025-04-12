FROM node:18-alpine

WORKDIR /app

# 設置環境變數
ENV NODE_ENV=production

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝所有依賴（包括 devDependencies）
# 移除了 --ignore-scripts 標誌以確保 TypeScript 正確安裝
RUN npm install

# 複製 tsconfig.json 和其他配置文件
COPY tsconfig.json ./

# 複製源代碼
COPY . .

# 使用 npx 運行 tsc，這樣更可靠
RUN npx tsc

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["node", "dist/bin/server.js"]