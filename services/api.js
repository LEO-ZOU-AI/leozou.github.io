import axios from 'axios';

const API_BASE_URL = '/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
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

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// API方法
export const apiService = {
  // 管理员认证
  adminLogin: (credentials) => api.post('/admin/login', credentials),
  
  // API密钥管理
  createApiKey: (keyData) => api.post('/admin/api-keys', keyData),
  getApiKeys: () => api.get('/admin/api-keys'),
  updateApiKey: (keyId, keyData) => api.put(`/admin/api-keys/${keyId}`, keyData),
  deleteApiKey: (keyId) => api.delete(`/admin/api-keys/${keyId}`),
  
  // 文本处理
  processText: (data) => api.post('/process-text', data),
  
  // 密钥验证
  validateKey: (apiKey) => api.post('/validate-key', { apiKey }),
  
  // 使用记录
  getUsageRecords: () => api.get('/admin/usage-records'),
};

export default api; 