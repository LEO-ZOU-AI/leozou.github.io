# 快速启动指南 ⚡

## 🚀 5分钟快速启动

### 1. 安装依赖
```bash
npm run install-all
```

### 2. 配置环境
```bash
cp .env.example .env
# 编辑 .env 文件，填入您的通义千问API密钥
```

### 3. 启动服务
```bash
npm run dev
```

### 4. 访问应用
- 🌐 主页: http://localhost:3000
- 👑 管理后台: http://localhost:3000/admin/login

## 🔑 默认管理员账号
- 用户名: `admin`
- 密码: `admin123`

⚠️ **重要**: 请在生产环境中修改默认密码！

## 📝 使用流程

### 管理员操作
1. 登录管理后台
2. 创建API密钥
3. 设置积分额度
4. 分发密钥给用户

### 用户操作
1. 获取API密钥
2. 在主页输入密钥
3. 粘贴文本（≤300单词）
4. 点击"开始处理"
5. 复制改写结果

## 🛠️ 常用命令

```bash
# 开发模式
npm run dev

# 仅启动后端
npm run server

# 仅启动前端
cd client && npm start

# 构建生产版本
npm run build

# 安装所有依赖
npm run install-all
```

## 🔧 环境变量配置

在 `.env` 文件中配置：

```env
# 必填：通义千问API密钥
QWEN_API_KEY=your_api_key_here

# 可选：服务器端口（默认5000）
PORT=5000

# 必填：JWT密钥（请使用强密码）
JWT_SECRET=your_jwt_secret

# 可选：管理员账号（建议修改）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## 🚨 注意事项

1. **API密钥**: 确保有效的通义千问API密钥
2. **端口冲突**: 如果端口被占用，修改 `.env` 中的 `PORT`
3. **安全性**: 生产环境请修改默认密码
4. **单词限制**: 每次处理限制300单词

## 📞 需要帮助？

查看完整文档：
- 📖 [README.md](README.md) - 项目介绍
- 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) - 部署指南

---

**开始使用里奥Leo降AI神器吧！** 🎯 