# 里奥Leo降AI神器 - 部署指南 🚀

本文档将指导您如何部署"里奥Leo降AI神器"到生产环境。

## 📋 部署前准备

### 1. 系统要求
- Node.js 16.0 或更高版本
- npm 8.0 或更高版本
- 通义千问API密钥
- 域名（可选，用于生产环境）

### 2. 获取通义千问API密钥
1. 访问 [阿里云控制台](https://dashscope.console.aliyun.com/)
2. 开通通义千问服务
3. 创建API密钥
4. 记录您的API密钥

## 🔧 本地开发部署

### 1. 克隆项目
```bash
git clone https://github.com/LEO-ZOU-AI/leozou.github.io.git
cd leozou.github.io
```

### 2. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 3. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
nano .env
```

在 `.env` 文件中配置：
```env
# 通义千问API配置
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation

# 服务器配置
PORT=5000
NODE_ENV=development

# JWT密钥 (请生成一个强密钥)
JWT_SECRET=your-super-secret-jwt-key-here

# 管理员账号 (请修改默认密码)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here
```

### 4. 启动开发服务器
```bash
# 同时启动前后端
npm run dev
```

访问地址：
- 前端: http://localhost:3000
- 后端API: http://localhost:5000
- 管理后台: http://localhost:3000/admin/login

## 🌐 生产环境部署

### 方案一：传统服务器部署

#### 1. 服务器准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2（进程管理器）
sudo npm install -g pm2

# 安装Nginx（反向代理）
sudo apt install nginx -y
```

#### 2. 部署应用
```bash
# 克隆项目
git clone https://github.com/LEO-ZOU-AI/leozou.github.io.git
cd leozou.github.io

# 安装依赖
npm run install-all

# 配置环境变量
cp .env.example .env
nano .env

# 构建前端
npm run build

# 使用PM2启动后端
pm2 start server/index.js --name "leo-ai-reducer"

# 设置PM2开机自启
pm2 startup
pm2 save
```

#### 3. 配置Nginx
创建Nginx配置文件：
```bash
sudo nano /etc/nginx/sites-available/leo-ai-reducer
```

配置内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/leozou.github.io/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/leo-ai-reducer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. 配置SSL（可选）
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 方案二：Docker部署

#### 1. 创建Dockerfile
```dockerfile
# 后端Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制package.json
COPY package*.json ./
COPY client/package*.json ./client/

# 安装依赖
RUN npm install
RUN cd client && npm install

# 复制源代码
COPY . .

# 构建前端
RUN cd client && npm run build

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["npm", "run", "server"]
```

#### 2. 创建docker-compose.yml
```yaml
version: '3.8'

services:
  leo-ai-reducer:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    env_file:
      - .env
    restart: unless-stopped
    volumes:
      - ./client/build:/app/client/build

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./client/build:/usr/share/nginx/html
    depends_on:
      - leo-ai-reducer
    restart: unless-stopped
```

#### 3. 部署命令
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 方案三：Vercel部署（推荐）

#### 1. 准备部署
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login
```

#### 2. 配置vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 3. 部署
```bash
# 部署到Vercel
vercel

# 设置环境变量
vercel env add QWEN_API_KEY
vercel env add JWT_SECRET
vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD

# 重新部署
vercel --prod
```

## 🔒 安全配置

### 1. 环境变量安全
- 使用强密码作为JWT_SECRET
- 修改默认管理员密码
- 妥善保管API密钥

### 2. 网络安全
- 启用HTTPS
- 配置防火墙
- 限制API访问频率

### 3. 应用安全
```javascript
// 在server/index.js中添加安全中间件
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 安全头
app.use(helmet());

// 限制请求频率
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
});
app.use('/api', limiter);
```

## 📊 监控和维护

### 1. 日志监控
```bash
# PM2日志
pm2 logs leo-ai-reducer

# Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. 性能监控
```bash
# PM2监控
pm2 monit

# 系统资源
htop
df -h
```

### 3. 备份策略
```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz /path/to/leozou.github.io
```

## 🚨 故障排除

### 常见问题

1. **API密钥无效**
   - 检查.env文件中的QWEN_API_KEY
   - 确认API密钥有效且有足够余额

2. **端口冲突**
   - 修改.env中的PORT配置
   - 检查端口是否被占用：`lsof -i :5000`

3. **前端无法访问后端**
   - 检查代理配置
   - 确认后端服务正常运行

4. **管理员无法登录**
   - 检查用户名密码配置
   - 查看服务器日志

### 日志分析
```bash
# 查看应用日志
pm2 logs leo-ai-reducer --lines 100

# 查看错误日志
grep -i error /var/log/nginx/error.log
```

## 📞 技术支持

如遇到部署问题，请：
1. 检查日志文件
2. 确认配置正确
3. 联系技术支持

---

**祝您部署顺利！** 🎉 