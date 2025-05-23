import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : '/api';

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
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// 管理员API
export const adminAPI = {
  // 登录
  login: async (credentials) => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  },

  // 获取所有API密钥
  getKeys: async () => {
    const response = await api.get('/admin/keys');
    return response.data;
  },

  // 创建API密钥
  createKey: async (keyData) => {
    const response = await api.post('/admin/keys', keyData);
    return response.data;
  },

  // 更新API密钥
  updateKey: async (id, keyData) => {
    const response = await api.put(`/admin/keys/${id}`, keyData);
    return response.data;
  },

  // 删除API密钥
  deleteKey: async (id) => {
    const response = await api.delete(`/admin/keys/${id}`);
    return response.data;
  },

  // 获取使用记录
  getUsageRecords: async () => {
    const response = await api.get('/admin/usage');
    return response.data;
  },
};

// 用户API
export const userAPI = {
  // 处理文本
  processText: async (text, apiKey) => {
    const response = await axios.post(`${API_BASE_URL}/reduce-ai`, 
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
      }
    );
    return response.data;
  },

  // 检查API密钥状态
  checkKeyStatus: async (apiKey) => {
    const response = await axios.get(`${API_BASE_URL}/key-status`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });
    return response.data;
  },

  // 健康检查
  healthCheck: async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },
};

export default api; 