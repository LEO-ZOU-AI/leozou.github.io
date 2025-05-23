import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Shield, 
  Zap, 
  Copy, 
  Key, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { apiService } from '../services/api';

const HomePage = () => {
  const [text, setText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyStatus, setKeyStatus] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [message, setMessage] = useState('');

  // 计算单词数
  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [text]);

  // 显示消息
  const showMessage = (msg, type = 'info') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 3000);
  };

  // 检查API密钥状态
  const checkApiKey = async (key) => {
    if (!key) {
      setKeyStatus(null);
      return;
    }

    try {
      const response = await apiService.validateKey(key);
      setKeyStatus(response.data.data);
    } catch (error) {
      setKeyStatus(null);
      if (error.response?.status === 401) {
        showMessage('API密钥无效', 'error');
      }
    }
  };

  // 处理API密钥输入
  const handleApiKeyChange = (e) => {
    const key = e.target.value;
    setApiKey(key);
    checkApiKey(key);
  };

  // 处理文本提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      showMessage('请输入要处理的文本', 'error');
      return;
    }

    if (!apiKey) {
      showMessage('请输入API密钥', 'error');
      return;
    }

    if (wordCount > 300) {
      showMessage('文本超过300单词限制', 'error');
      return;
    }

    if (keyStatus && keyStatus.credits < wordCount) {
      showMessage('积分不足，无法处理此文本', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data.reducedText);
        showMessage('文本处理成功！', 'success');
        
        // 更新密钥状态
        checkApiKey(apiKey);
      } else {
        showMessage(data.error || '处理失败，请稍后重试', 'error');
      }
    } catch (error) {
      console.error('处理失败:', error);
      showMessage('处理失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 复制结果
  const copyResult = () => {
    navigator.clipboard.writeText(result);
    showMessage('结果已复制到剪贴板', 'success');
  };

  // 清空表单
  const clearForm = () => {
    setText('');
    setResult('');
    setWordCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 消息提示 */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500 text-white' :
          message.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold gradient-text">里奥Leo降AI神器</span>
            </div>
            <Link 
              href="/admin"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>管理后台</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 头部介绍 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="gradient-text">里奥Leo</span>
            <br />
            <span className="text-blue-600">降AI神器</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            专业的AI检测率降低工具，针对Turnitin等检测系统优化，确保100%通过率
          </p>
          
          {/* 特性展示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200 card-shadow">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">100%通过率</h3>
              <p className="text-gray-600">专门针对Turnitin等AI检测系统优化</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200 card-shadow">
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">快速处理</h3>
              <p className="text-gray-600">基于通义千问AI，秒级完成文本改写</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200 card-shadow">
              <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">保持原意</h3>
              <p className="text-gray-600">智能改写，确保内容质量和原意不变</p>
            </div>
          </div>
        </div>

        {/* 主要功能区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入区域 */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 card-shadow">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              文本输入
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* API密钥输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Key className="h-4 w-4 inline mr-1" />
                  API密钥
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="请输入您的API密钥"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {keyStatus && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-800">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        密钥有效 - 剩余积分: {keyStatus.credits}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 文本输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文本内容 ({wordCount}/300 单词)
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="请粘贴您要处理的文本内容..."
                  rows={12}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                    wordCount > 300 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {wordCount > 300 && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-800">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        文本超过300单词限制，请减少内容
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading || !text.trim() || !apiKey || wordCount > 300}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-hover"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>处理中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>开始处理</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors btn-hover"
                >
                  清空
                </button>
              </div>
            </form>
          </div>

          {/* 结果区域 */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 card-shadow">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
              处理结果
            </h2>
            
            {result ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">
                      改写完成
                    </span>
                    <button
                      onClick={copyResult}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="text-sm">复制</span>
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
                      {result}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">处理结果将在这里显示</p>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200 card-shadow">
          <h3 className="text-xl font-bold mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">使用步骤：</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>输入您的API密钥</li>
                <li>粘贴要处理的文本（≤300单词）</li>
                <li>点击"开始处理"按钮</li>
                <li>复制改写后的结果</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">注意事项：</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>每次处理限制300单词以内</li>
                <li>消耗积分 = 文本单词数</li>
                <li>确保API密钥有足够积分</li>
                <li>处理后请检查改写质量</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 里奥Leo降AI神器. 让您的文本更加自然、人性化 🎯
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 