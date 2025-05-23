import jwt from 'jsonwebtoken';
import { storage } from './storage';

// JWT验证中间件
export const authenticateToken = (handler) => {
  return async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: '访问令牌缺失' });
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      const user = jwt.verify(token, jwtSecret);
      req.user = user;
      return handler(req, res);
    } catch (err) {
      return res.status(403).json({ error: '无效的访问令牌' });
    }
  };
};

// API密钥验证中间件
export const validateApiKey = (handler) => {
  return async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: '请提供API密钥' });
    }

    const key = storage.findApiKey(apiKey);
    
    if (!key) {
      return res.status(401).json({ error: '无效的API密钥' });
    }

    if (key.credits <= 0) {
      return res.status(403).json({ error: '积分不足，请联系管理员充值' });
    }

    req.apiKey = key;
    return handler(req, res);
  };
}; 