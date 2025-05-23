import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'http://localhost:3001';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// 管理员API
export const adminAPI = {
  // 登录
  login: (credentials) => {
    return api.post('/api/admin/login', credentials);
  },

  // 获取所有API密钥
  getKeys: () => {
    return api.get('/api/admin/keys');
  },

  // 创建API密钥
  createKey: (keyData) => {
    return api.post('/api/admin/keys', keyData);
  },

  // 更新API密钥
  updateKey: (id, keyData) => {
    return api.put(`/api/admin/keys/${id}`, keyData);
  },

  // 删除API密钥
  deleteKey: (id) => {
    return api.delete(`/api/admin/keys/${id}`);
  },

  // 获取使用记录
  getUsage: (params = {}) => {
    return api.get('/api/admin/usage', { params });
  }
};

// 用户API
export const userAPI = {
  // 检查API密钥状态
  checkKeyStatus: (apiKey) => {
    return api.get('/api/key-status', {
      headers: { 'X-API-Key': apiKey }
    });
  },

  // 文本降AI处理
  reduceAI: (text, apiKey) => {
    return api.post('/api/reduce-ai', { text }, {
      headers: { 'X-API-Key': apiKey }
    });
  },

  // 健康检查
  healthCheck: () => {
    return api.get('/api/health');
  }
};

export default api; 