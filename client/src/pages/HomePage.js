import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Shield, 
  Zap, 
  Target, 
  Copy, 
  Paste, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Key,
  Crown,
  Sparkles,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import { userAPI } from '../services/api';

const HomePage = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [keyStatus, setKeyStatus] = useState(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // 计算单词数
  useEffect(() => {
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [inputText]);

  // 检查API密钥状态
  useEffect(() => {
    if (apiKey) {
      checkApiKeyStatus();
    }
  }, [apiKey]);

  const checkApiKeyStatus = async () => {
    try {
      const response = await userAPI.checkKeyStatus(apiKey);
      setKeyStatus(response.data);
    } catch (error) {
      setKeyStatus(null);
      if (error.response?.status === 401) {
        toast.error('无效的API密钥');
      }
    }
  };

  const handleProcessText = async () => {
    if (!inputText.trim()) {
      toast.error('请输入要处理的文本');
      return;
    }

    if (wordCount > 300) {
      toast.error(`文本超过300单词限制，当前为${wordCount}个单词`);
      return;
    }

    if (!apiKey) {
      toast.error('请输入API密钥');
      setShowApiKeyInput(true);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await userAPI.processText(inputText, apiKey);
      setOutputText(response.data.processedText);
      setKeyStatus(prev => ({
        ...prev,
        remainingCredits: response.data.remainingCredits
      }));
      toast.success(`处理成功！消耗${response.data.creditsUsed}积分`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || '处理失败，请重试';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyOutput = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      toast.success('已复制到剪贴板');
    }
  };

  const handlePasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      toast.success('已粘贴文本');
    } catch (error) {
      toast.error('粘贴失败，请手动输入');
    }
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setWordCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gradient">里奥Leo降AI神器</h1>
            </div>
            <Link 
              to="/admin/login"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Crown className="w-4 h-4" />
              <span>管理员</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              专业的
              <span className="text-gradient"> AI检测率降低 </span>
              工具
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              针对Turnitin优化，百分百降低AI检测率。使用先进的通义千问技术，
              让您的文本更加自然、人性化，轻松通过各种AI检测系统。
            </p>
            
            {/* 特性卡片 */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 mb-16">
              <div className="card animate-slide-up">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">精准降AI</h3>
                <p className="text-gray-600">专门针对Turnitin等检测系统优化，确保100%通过率</p>
              </div>
              <div className="card animate-slide-up" style={{animationDelay: '0.1s'}}>
                <Zap className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">快速处理</h3>
                <p className="text-gray-600">基于通义千问AI，秒级完成文本改写，保持原意不变</p>
              </div>
              <div className="card animate-slide-up" style={{animationDelay: '0.2s'}}>
                <Sparkles className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">智能优化</h3>
                <p className="text-gray-600">智能调整语言风格，让文本更加自然流畅</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 主要功能区域 */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* API密钥输入 */}
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Key className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold">API密钥</h3>
              </div>
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {showApiKeyInput ? '隐藏' : '显示'}
              </button>
            </div>
            
            {showApiKeyInput && (
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="请输入您的API密钥"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="input-field"
                />
                {keyStatus && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">{keyStatus.keyName}</span>
                    </div>
                    <div className="text-green-700">
                      剩余积分: <span className="font-bold">{keyStatus.remainingCredits}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 文本处理区域 */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 输入区域 */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">原始文本</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePasteInput}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Paste className="w-4 h-4" />
                    <span>粘贴</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>重置</span>
                  </button>
                </div>
              </div>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="请输入要处理的文本（最多300个单词）..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${wordCount > 300 ? 'text-red-600' : 'text-gray-600'}`}>
                    单词数: {wordCount}/300
                  </span>
                  {wordCount > 300 && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">超出限制</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleProcessText}
                  disabled={isProcessing || !inputText.trim() || wordCount > 300 || !apiKey}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>处理中<span className="loading-dots"></span></span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>开始处理</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 输出区域 */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">处理结果</h3>
                {outputText && (
                  <button
                    onClick={handleCopyOutput}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>复制</span>
                  </button>
                )}
              </div>
              
              <div className="w-full h-64 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto">
                {outputText ? (
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{outputText}</p>
                ) : (
                  <p className="text-gray-500 italic">处理后的文本将在这里显示...</p>
                )}
              </div>
              
              {outputText && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">处理完成！</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    文本已成功改写，AI检测率大幅降低，可安全使用。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 统计数据 */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">为什么选择里奥Leo降AI神器？</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              我们的工具已经帮助数千名用户成功通过AI检测，获得了广泛认可。
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">100%</div>
              <div className="text-gray-600">通过率</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">10K+</div>
              <div className="text-gray-600">满意用户</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">&lt;3s</div>
              <div className="text-gray-600">处理速度</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">在线服务</div>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">里奥Leo降AI神器</h3>
            </div>
            <p className="text-gray-400 mb-6">
              专业的AI检测率降低工具，让您的文本更加自然、人性化
            </p>
            <div className="text-sm text-gray-500">
              © 2024 里奥Leo降AI神器. 保留所有权利.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 