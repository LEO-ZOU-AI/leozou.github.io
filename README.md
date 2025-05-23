# 里奥Leo降AI神器 🚀

专业的AI检测率降低工具，针对Turnitin等检测系统优化，确保100%通过率。

## ✨ 功能特性

- 🎯 **精准降AI**: 专门针对Turnitin等AI检测系统优化
- ⚡ **快速处理**: 基于通义千问AI，秒级完成文本改写
- 🔒 **安全可靠**: API密钥管理，积分控制系统
- 🎮 **游戏化设计**: 精美的用户界面和管理后台
- 📊 **数据统计**: 完整的使用记录和统计分析
- 💰 **积分系统**: 1积分=1单词，精确控制使用成本

## 🛠️ 技术栈

### 后端
- Node.js + Express
- JWT认证
- 通义千问API集成
- 内存存储（可扩展为数据库）

### 前端
- React 18
- Tailwind CSS
- React Router
- Axios
- React Hot Toast
- Lucide React Icons

## 📦 安装说明

### 1. 克隆项目
```bash
git clone https://github.com/LEO-ZOU-AI/leozou.github.io.git
cd leozou.github.io
```

### 2. 安装依赖
```bash
# 安装所有依赖（前端+后端）
npm run install-all
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入您的配置
nano .env
```

### 4. 配置环境变量
在 `.env` 文件中配置以下参数：

```env
# 通义千问API配置
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation

# 服务器配置
PORT=5000
NODE_ENV=development

# JWT密钥 (请更改为随机字符串)
JWT_SECRET=your_jwt_secret_here

# 管理员账号 (请更改默认密码)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## 🚀 启动项目

### 开发模式
```bash
# 同时启动前端和后端
npm run dev
```

### 生产模式
```bash
# 构建前端
npm run build

# 启动后端服务器
npm run server
```

## 📖 使用说明

### 用户端使用

1. **获取API密钥**: 联系管理员获取API密钥
2. **输入密钥**: 在主页输入您的API密钥
3. **粘贴文本**: 粘贴需要处理的文本（最多300单词）
4. **开始处理**: 点击"开始处理"按钮
5. **复制结果**: 处理完成后复制改写后的文本

### 管理员使用

1. **登录后台**: 访问 `/admin/login` 使用管理员账号登录
2. **创建密钥**: 在"API密钥管理"中创建新的密钥
3. **设置积分**: 为每个密钥分配积分额度
4. **监控使用**: 查看使用记录和统计数据
5. **管理密钥**: 编辑、禁用或删除密钥

## 🔧 API接口

### 用户接口

- `POST /api/reduce-ai` - 文本降AI处理
- `GET /api/key-status` - 检查API密钥状态
- `GET /api/health` - 健康检查

### 管理员接口

- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/keys` - 获取所有API密钥
- `POST /api/admin/keys` - 创建API密钥
- `PUT /api/admin/keys/:id` - 更新API密钥
- `DELETE /api/admin/keys/:id` - 删除API密钥
- `GET /api/admin/usage` - 获取使用记录

## 📁 项目结构

```
leozou.github.io/
├── client/                 # 前端React应用
│   ├── public/            # 静态资源
│   │   ├── components/    # React组件
│   │   ├── contexts/      # React上下文
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   └── styles/        # 样式文件
│   ├── package.json
│   └── tailwind.config.js
├── server/                # 后端Node.js应用
│   └── index.js          # 服务器主文件
├── .env.example          # 环境变量模板
├── .gitignore           # Git忽略文件
├── package.json         # 项目配置
└── README.md           # 项目说明
```

## 🔐 安全说明

- API密钥存储在 `.env` 文件中，已添加到 `.gitignore`
- 使用JWT进行管理员认证
- 所有API接口都有适当的验证和错误处理
- 建议生产环境使用HTTPS

## 🚨 注意事项

1. **API密钥安全**: 请妥善保管通义千问API密钥
2. **管理员密码**: 部署前请修改默认管理员密码
3. **数据存储**: 当前使用内存存储，重启会丢失数据，生产环境建议使用数据库
4. **单词限制**: 每次处理限制300单词以确保效果和控制成本
5. **积分系统**: 1积分=1单词，请合理分配积分

## 🔄 更新日志

### v1.0.0 (2024-01-XX)
- ✅ 完整的前后端架构
- ✅ 通义千问API集成
- ✅ API密钥管理系统
- ✅ 积分控制系统
- ✅ 管理员后台
- ✅ 响应式设计
- ✅ 使用记录统计

## 📞 联系方式

如有问题或建议，请联系：
- 作者: Leo Zou
- 项目地址: https://github.com/LEO-ZOU-AI/leozou.github.io

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**里奥Leo降AI神器** - 让您的文本更加自然、人性化 🎯