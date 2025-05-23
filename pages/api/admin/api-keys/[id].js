import { authenticateToken } from '../../../../lib/auth';
import { storage } from '../../../../lib/storage';

async function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      return handlePut(req, res, id);
    case 'DELETE':
      return handleDelete(req, res, id);
    default:
      return res.status(405).json({ error: '方法不允许' });
  }
}

// 更新API密钥
async function handlePut(req, res, id) {
  try {
    const { credits, status } = req.body;
    
    const updates = {};
    if (credits !== undefined) {
      updates.credits = parseInt(credits);
      updates.originalCredits = parseInt(credits);
    }
    if (status !== undefined) {
      updates.status = status;
    }

    const updatedKey = storage.updateApiKey(id, updates);
    
    if (!updatedKey) {
      return res.status(404).json({ error: '密钥不存在' });
    }

    res.json({
      success: true,
      key: updatedKey,
      message: '密钥更新成功'
    });
  } catch (error) {
    console.error('更新密钥失败:', error);
    res.status(500).json({ error: '更新密钥失败' });
  }
}

// 删除API密钥
async function handleDelete(req, res, id) {
  try {
    const deletedKey = storage.deleteApiKey(id);
    
    if (!deletedKey) {
      return res.status(404).json({ error: '密钥不存在' });
    }

    res.json({
      success: true,
      message: '密钥删除成功'
    });
  } catch (error) {
    console.error('删除密钥失败:', error);
    res.status(500).json({ error: '删除密钥失败' });
  }
}

export default authenticateToken(handler); 