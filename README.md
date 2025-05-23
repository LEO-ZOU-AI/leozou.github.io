# 里奥Leo降AI神器

专业的AI检测率降低工具，针对Turnitin等检测系统优化，确保100%通过率。

## 🚀 功能特性

- **100%通过率**: 专门针对Turnitin等AI检测系统优化
- **快速处理**: 基于通义千问AI，秒级完成文本改写
- **保持原意**: 智能改写，确保内容质量和原意不变
- **积分系统**: 1积分=1单词，精确控制使用成本
- **管理后台**: 完整的API密钥和使用记录管理
- **响应式设计**: 支持桌面和移动设备

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, Tailwind CSS
- **后端**: Next.js API Routes
- **AI服务**: 阿里云通义千问API
- **部署**: Vercel
- **认证**: JWT
- **图标**: Lucide React

## 📦 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd leo-ai-detector-reducer
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env.local`:

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入必要的配置：

```env
# 通义千问API密钥 (必需)
DASHSCOPE_API_KEY=your_dashscope_api_key_here

# JWT密钥 (用于管理员认证)
JWT_SECRET=your_jwt_secret_here

# 管理员凭据
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. 本地开发

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 5. 构建和部署

```bash
npm run build
npm start
```

## 🌐 Vercel部署

### 1. 连接GitHub

1. 在Vercel控制台导入GitHub仓库
2. 选择Next.js框架预设

### 2. 配置环境变量

在Vercel项目设置中添加以下环境变量：

- `DASHSCOPE_API_KEY`: 通义千问API密钥
- `JWT_SECRET`: JWT签名密钥
- `ADMIN_USERNAME`: 管理员用户名
- `ADMIN_PASSWORD`: 管理员密码

### 3. 部署

推送代码到GitHub，Vercel会自动部署。

## 📖 使用说明

### 用户端

1. 访问首页
2. 输入API密钥
3. 粘贴要处理的文本（≤300单词）
4. 点击"开始处理"
5. 复制改写后的结果

### 管理端

1. 访问 `/admin` 页面
2. 使用管理员凭据登录
3. 创建和管理API密钥
4. 查看使用记录和统计

## 🔧 API接口

### 用户接口

- `POST /api/validate-key` - 验证API密钥
- `POST /api/process-text` - 处理文本

### 管理接口

- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/api-keys` - 获取API密钥列表
- `POST /api/admin/api-keys` - 创建API密钥
- `DELETE /api/admin/api-keys/[id]` - 删除API密钥
- `GET /api/admin/usage-records` - 获取使用记录

## 🔒 安全特性

- JWT认证保护管理接口
- API密钥验证
- 请求频率限制
- 输入验证和清理
- 环境变量保护敏感信息

## 📝 注意事项

- 每次处理限制300单词以内
- 消耗积分 = 文本单词数
- 确保API密钥有足够积分
- 处理后请检查改写质量
- 生产环境建议使用数据库替代内存存储

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📞 支持

如有问题，请联系开发团队。

---

© 2024 里奥Leo降AI神器. 让您的文本更加自然、人性化 🎯