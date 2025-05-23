const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    
    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const isValidPassword = await bcrypt.compare(password, await bcrypt.hash(process.env.ADMIN_PASSWORD, 10));
    
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
      remainingCredits: parseInt(credits),
      createdAt: new Date().toISOString(),
      isActive: true
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
    const { credits, isActive } = req.body;
    
    const keyIndex = apiKeys.findIndex(key => key.id === id);
    if (keyIndex === -1) {
      return res.status(404).json({ error: '密钥不存在' });
    }

    if (credits !== undefined) {
      apiKeys[keyIndex].credits = parseInt(credits);
      apiKeys[keyIndex].remainingCredits = parseInt(credits);
    }
    
    if (isActive !== undefined) {
      apiKeys[keyIndex].isActive = isActive;
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

  const key = apiKeys.find(k => k.key === apiKey && k.isActive);
  
  if (!key) {
    return res.status(401).json({ error: '无效的API密钥' });
  }

  if (key.remainingCredits <= 0) {
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
    if (req.apiKey.remainingCredits < wordCount) {
      return res.status(403).json({ 
        error: `积分不足，需要${wordCount}积分，剩余${req.apiKey.remainingCredits}积分` 
      });
    }

    // 调用通义千问API
    const qwenResponse = await axios.post(
      process.env.QWEN_API_URL,
      {
        model: "qwen-turbo",
        input: {
          messages: [
            {
              role: "system",
              content: "你是一个专业的文本改写助手。请将用户提供的文本进行改写，使其保持原意的同时降低AI检测率。改写要求：1. 保持原文的核心意思和逻辑结构 2. 使用更自然、更人性化的表达方式 3. 适当调整句式结构和词汇选择 4. 确保语法正确、表达流畅 5. 避免使用过于机械化的表达。请直接返回改写后的文本，不要添加任何解释。"
            },
            {
              role: "user",
              content: text
            }
          ]
        },
        parameters: {
          temperature: 0.8,
          top_p: 0.9,
          max_tokens: 1000
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const processedText = qwenResponse.data.output.choices[0].message.content;

    // 扣除积分
    const keyIndex = apiKeys.findIndex(k => k.id === req.apiKey.id);
    apiKeys[keyIndex].remainingCredits -= wordCount;

    // 记录使用情况
    usageRecords.push({
      id: uuidv4(),
      keyId: req.apiKey.id,
      keyName: req.apiKey.name,
      originalText: text,
      processedText: processedText,
      wordCount: wordCount,
      creditsUsed: wordCount,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        originalText: text,
        processedText: processedText,
        wordCount: wordCount,
        creditsUsed: wordCount,
        remainingCredits: apiKeys[keyIndex].remainingCredits
      },
      message: '文本处理成功'
    });

  } catch (error) {
    console.error('处理文本时出错:', error);
    
    if (error.response) {
      res.status(500).json({ 
        error: '通义千问API调用失败',
        details: error.response.data 
      });
    } else {
      res.status(500).json({ error: '服务器内部错误' });
    }
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
      remainingCredits: req.apiKey.remainingCredits,
      totalCredits: req.apiKey.credits
    }
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '里奥Leo降AI神器服务正常运行',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 里奥Leo降AI神器服务器运行在端口 ${PORT}`);
  console.log(`📝 请确保已配置 .env 文件中的通义千问API密钥`);
}); 