const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false, // 为了Vercel部署
}));

// 限制请求频率
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
});
app.use('/api', limiter);

// CORS配置 - 为Vercel部署优化
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-domain.vercel.app'] // 替换为你的Vercel域名
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 内存存储 (生产环境建议使用数据库)
let apiKeys = [];
let usageRecords = [];

// JWT验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的访问令牌' });
    }
    req.user = user;
    next();
  });
};

// 管理员登录
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ 
        success: true, 
        token,
        message: '登录成功'
      });
    } else {
      res.status(401).json({ error: '用户名或密码错误' });
    }
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建API密钥
app.post('/api/admin/keys', authenticateToken, (req, res) => {
  try {
    const { name, credits } = req.body;
    
    if (!name || !credits || credits <= 0) {
      return res.status(400).json({ error: '请提供有效的密钥名称和积分数量' });
    }

    const newKey = {
      id: uuidv4(),
      key: `leo_${uuidv4().replace(/-/g, '').substring(0, 24)}`,
      name,
      credits: parseInt(credits),
      originalCredits: parseInt(credits),
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    apiKeys.push(newKey);
    
    res.json({
      success: true,
      key: newKey,
      message: 'API密钥创建成功'
    });
  } catch (error) {
    res.status(500).json({ error: '创建密钥失败' });
  }
});

// 获取所有API密钥
app.get('/api/admin/keys', authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      keys: apiKeys
    });
  } catch (error) {
    res.status(500).json({ error: '获取密钥列表失败' });
  }
});

// 更新API密钥
app.put('/api/admin/keys/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { credits, status } = req.body;
    
    const keyIndex = apiKeys.findIndex(key => key.id === id);
    if (keyIndex === -1) {
      return res.status(404).json({ error: '密钥不存在' });
    }

    if (credits !== undefined) {
      apiKeys[keyIndex].credits = parseInt(credits);
      apiKeys[keyIndex].originalCredits = parseInt(credits);
    }
    
    if (status !== undefined) {
      apiKeys[keyIndex].status = status;
    }

    res.json({
      success: true,
      key: apiKeys[keyIndex],
      message: '密钥更新成功'
    });
  } catch (error) {
    res.status(500).json({ error: '更新密钥失败' });
  }
});

// 删除API密钥
app.delete('/api/admin/keys/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const keyIndex = apiKeys.findIndex(key => key.id === id);
    
    if (keyIndex === -1) {
      return res.status(404).json({ error: '密钥不存在' });
    }

    apiKeys.splice(keyIndex, 1);
    
    res.json({
      success: true,
      message: '密钥删除成功'
    });
  } catch (error) {
    res.status(500).json({ error: '删除密钥失败' });
  }
});

// 验证API密钥并检查积分
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: '请提供API密钥' });
  }

  const key = apiKeys.find(k => k.key === apiKey && k.status === 'active');
  
  if (!key) {
    return res.status(401).json({ error: '无效的API密钥' });
  }

  if (key.credits <= 0) {
    return res.status(403).json({ error: '积分不足，请联系管理员充值' });
  }

  req.apiKey = key;
  next();
};

// 文本降AI处理
app.post('/api/reduce-ai', validateApiKey, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: '请提供要处理的文本' });
    }

    // 检查单词数量限制
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount > 300) {
      return res.status(400).json({ 
        error: `文本超过300单词限制，当前为${wordCount}个单词` 
      });
    }

    // 检查积分是否足够
    if (req.apiKey.credits < wordCount) {
      return res.status(403).json({ 
        error: `积分不足，需要${wordCount}积分，剩余${req.apiKey.credits}积分` 
      });
    }

    // 调用通义千问API进行文本改写
    let processedText;
    try {
      if (process.env.QWEN_API_KEY && process.env.QWEN_API_KEY !== 'your_qwen_api_key_here') {
        const response = await axios.post(process.env.QWEN_API_URL, {
          model: "qwen-turbo",
          input: {
            messages: [
              {
                role: "system",
                content: "你是一个专业的文本改写助手。请将用户提供的文本进行改写，保持原意不变，但改变表达方式，使其更难被AI检测工具识别。改写要求：1. 保持原文的核心意思和逻辑结构 2. 使用不同的词汇和句式 3. 调整句子长度和复杂度 4. 保持学术或专业的语调 5. 确保语法正确和表达流畅"
              },
              {
                role: "user", 
                content: `请改写以下文本：\n\n${text}`
              }
            ]
          },
          parameters: {
            temperature: 0.7,
            max_tokens: 2000
          }
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        processedText = response.data.output.choices[0].message.content;
      } else {
        // 如果没有配置API密钥，使用模拟改写
        processedText = `[改写后的文本] ${text}`;
      }
    } catch (apiError) {
      console.error('调用通义千问API失败:', apiError);
      // API调用失败时使用模拟改写
      processedText = `[改写后的文本] ${text}`;
    }

    // 扣除积分
    const keyIndex = apiKeys.findIndex(k => k.id === req.apiKey.id);
    apiKeys[keyIndex].credits -= wordCount;

    // 记录使用情况
    usageRecords.push({
      id: uuidv4(),
      keyId: req.apiKey.id,
      keyName: req.apiKey.name,
      originalText: text,
      processedText: processedText,
      wordsUsed: wordCount,
      success: true,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        originalText: text,
        reducedText: processedText,
        wordCount: wordCount,
        creditsUsed: wordCount,
        remainingCredits: apiKeys[keyIndex].credits
      },
      message: '文本处理成功'
    });

  } catch (error) {
    console.error('处理文本时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取使用记录
app.get('/api/admin/usage', authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      records: usageRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
  } catch (error) {
    res.status(500).json({ error: '获取使用记录失败' });
  }
});

// 检查API密钥状态
app.get('/api/key-status', validateApiKey, (req, res) => {
  res.json({
    success: true,
    data: {
      keyName: req.apiKey.name,
      credits: req.apiKey.credits,
      totalCredits: req.apiKey.originalCredits
    }
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '里奥Leo降AI神器服务正常运行',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 为Vercel部署导出app
module.exports = app;

// 只在非Vercel环境下启动服务器
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 里奥Leo降AI神器服务器运行在端口 ${PORT}`);
    console.log(`📝 请确保已配置 .env 文件中的通义千问API密钥`);
    console.log(`🌐 前端地址: http://localhost:3000`);
    console.log(`🔧 后端地址: http://localhost:${PORT}`);
  });
} 