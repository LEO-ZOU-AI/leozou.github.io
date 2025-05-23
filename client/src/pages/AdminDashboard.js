import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Shield, 
  Key, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  LogOut,
  Home,
  Activity,
  Users,
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('keys');
  const [apiKeys, setApiKeys] = useState([]);
  const [usageRecords, setUsageRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  
  const { logout } = useAuth();

  // 新建密钥表单
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    credits: ''
  });

  // 编辑密钥表单
  const [editKeyForm, setEditKeyForm] = useState({
    credits: '',
    isActive: true
  });

  useEffect(() => {
    loadApiKeys();
    loadUsageRecords();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await adminAPI.getKeys();
      setApiKeys(response.keys);
    } catch (error) {
      toast.error('加载API密钥失败');
    }
  };

  const loadUsageRecords = async () => {
    try {
      const response = await adminAPI.getUsageRecords();
      setUsageRecords(response.records);
    } catch (error) {
      toast.error('加载使用记录失败');
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    
    if (!newKeyForm.name || !newKeyForm.credits) {
      toast.error('请填写完整信息');
      return;
    }

    if (parseInt(newKeyForm.credits) <= 0) {
      toast.error('积分数量必须大于0');
      return;
    }

    setIsLoading(true);
    try {
      await adminAPI.createKey(newKeyForm);
      toast.success('API密钥创建成功');
      setShowCreateModal(false);
      setNewKeyForm({ name: '', credits: '' });
      loadApiKeys();
    } catch (error) {
      toast.error('创建密钥失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditKey = async (e) => {
    e.preventDefault();
    
    if (!editKeyForm.credits || parseInt(editKeyForm.credits) <= 0) {
      toast.error('积分数量必须大于0');
      return;
    }

    setIsLoading(true);
    try {
      await adminAPI.updateKey(selectedKey.id, editKeyForm);
      toast.success('密钥更新成功');
      setShowEditModal(false);
      setSelectedKey(null);
      loadApiKeys();
    } catch (error) {
      toast.error('更新密钥失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async (keyId, keyName) => {
    if (!window.confirm(`确定要删除密钥 "${keyName}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await adminAPI.deleteKey(keyId);
      toast.success('密钥删除成功');
      loadApiKeys();
    } catch (error) {
      toast.error('删除密钥失败');
    }
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('密钥已复制到剪贴板');
  };

  const toggleKeyVisibility = (keyId) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const openEditModal = (key) => {
    setSelectedKey(key);
    setEditKeyForm({
      credits: key.credits.toString(),
      isActive: key.isActive
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getTotalCredits = () => {
    return apiKeys.reduce((total, key) => total + key.credits, 0);
  };

  const getRemainingCredits = () => {
    return apiKeys.reduce((total, key) => total + key.remainingCredits, 0);
  };

  const getUsedCredits = () => {
    return getTotalCredits() - getRemainingCredits();
  };

  const getActiveKeysCount = () => {
    return apiKeys.filter(key => key.isActive).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gradient">管理后台</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>返回首页</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">活跃密钥</p>
                <p className="text-2xl font-bold text-gray-900">{getActiveKeysCount()}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总积分</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalCredits().toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">剩余积分</p>
                <p className="text-2xl font-bold text-gray-900">{getRemainingCredits().toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已使用积分</p>
                <p className="text-2xl font-bold text-gray-900">{getUsedCredits().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="card">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('keys')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'keys'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                API密钥管理
              </button>
              <button
                onClick={() => setActiveTab('usage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'usage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                使用记录
              </button>
            </nav>
          </div>

          {/* API密钥管理 */}
          {activeTab === 'keys' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">API密钥列表</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={loadApiKeys}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>刷新</span>
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>创建密钥</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        密钥
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        积分
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        创建时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiKeys.map((key) => (
                      <tr key={key.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{key.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {visibleKeys.has(key.id) 
                                ? key.key 
                                : key.key.substring(0, 8) + '...' + key.key.substring(key.key.length - 4)
                              }
                            </code>
                            <button
                              onClick={() => toggleKeyVisibility(key.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {visibleKeys.has(key.id) ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCopyKey(key.key)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {key.remainingCredits} / {key.credits}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(key.remainingCredits / key.credits) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            key.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {key.isActive ? '活跃' : '禁用'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(key.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(key)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteKey(key.id, key.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {apiKeys.length === 0 && (
                <div className="text-center py-12">
                  <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">暂无API密钥</p>
                </div>
              )}
            </div>
          )}

          {/* 使用记录 */}
          {activeTab === 'usage' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">使用记录</h3>
                <button
                  onClick={loadUsageRecords}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>刷新</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        密钥名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        单词数
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        消耗积分
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        使用时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        原始文本
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usageRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.keyName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.wordCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.creditsUsed}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(record.timestamp)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {record.originalText}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {usageRecords.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">暂无使用记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 创建密钥模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">创建新的API密钥</h3>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密钥名称
                </label>
                <input
                  type="text"
                  value={newKeyForm.name}
                  onChange={(e) => setNewKeyForm({...newKeyForm, name: e.target.value})}
                  className="input-field"
                  placeholder="请输入密钥名称"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  积分数量
                </label>
                <input
                  type="number"
                  value={newKeyForm.credits}
                  onChange={(e) => setNewKeyForm({...newKeyForm, credits: e.target.value})}
                  className="input-field"
                  placeholder="请输入积分数量"
                  min="1"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  {isLoading ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑密钥模态框 */}
      {showEditModal && selectedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">编辑API密钥</h3>
            <form onSubmit={handleEditKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密钥名称
                </label>
                <input
                  type="text"
                  value={selectedKey.name}
                  className="input-field bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  积分数量
                </label>
                <input
                  type="number"
                  value={editKeyForm.credits}
                  onChange={(e) => setEditKeyForm({...editKeyForm, credits: e.target.value})}
                  className="input-field"
                  placeholder="请输入积分数量"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editKeyForm.isActive}
                    onChange={(e) => setEditKeyForm({...editKeyForm, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">启用密钥</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  {isLoading ? '更新中...' : '更新'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 