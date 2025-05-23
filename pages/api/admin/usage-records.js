import { authenticateToken } from '../../../lib/auth';
import { storage } from '../../../lib/storage';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const records = storage.getUsageRecords();
    res.json({
      success: true,
      records: records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
  } catch (error) {
    console.error('获取使用记录失败:', error);
    res.status(500).json({ error: '获取使用记录失败' });
  }
}

export default authenticateToken(handler); 