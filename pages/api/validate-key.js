import { storage } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: '请提供API密钥' });
    }

    const key = storage.findApiKey(apiKey);
    
    if (!key) {
      return res.status(401).json({ error: '无效的API密钥' });
    }

    res.json({
      success: true,
      data: {
        keyName: key.name,
        credits: key.credits,
        totalCredits: key.originalCredits,
        status: key.status
      }
    });
  } catch (error) {
    console.error('验证密钥失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
} 