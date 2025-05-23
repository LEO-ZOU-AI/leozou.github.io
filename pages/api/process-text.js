import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { validateApiKey } from '../../lib/auth';
import { storage } from '../../lib/storage';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

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
      const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
      
      if (dashscopeApiKey && dashscopeApiKey !== 'your_dashscope_api_key_here') {
        const response = await axios.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
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
            'Authorization': `Bearer ${dashscopeApiKey}`,
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
    const updatedKey = storage.updateApiKey(req.apiKey.id, {
      credits: req.apiKey.credits - wordCount
    });

    // 记录使用情况
    storage.addUsageRecord({
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
        remainingCredits: updatedKey.credits
      },
      message: '文本处理成功'
    });

  } catch (error) {
    console.error('处理文本时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
}

export default validateApiKey(handler); 