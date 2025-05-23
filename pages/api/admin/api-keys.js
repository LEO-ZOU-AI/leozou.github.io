import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../../../lib/auth';
import { storage } from '../../../lib/storage';

async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      return res.status(405).json({ error: '方法不允许' });
  }
}

// 获取所有API密钥
async function handleGet(req, res) {
  try {
    const keys = storage.getApiKeys();
    res.json({
      success: true,
      keys: keys
    });
  } catch (error) {
    console.error('获取密钥列表失败:', error);
    res.status(500).json({ error: '获取密钥列表失败' });
  }
}

// 创建API密钥
async function handlePost(req, res) {
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

    storage.addApiKey(newKey);
    
    res.json({
      success: true,
      key: newKey,
      message: 'API密钥创建成功'
    });
  } catch (error) {
    console.error('创建密钥失败:', error);
    res.status(500).json({ error: '创建密钥失败' });
  }
}

export default authenticateToken(handler); 