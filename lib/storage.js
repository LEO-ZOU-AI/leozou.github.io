// 内存存储 (生产环境建议使用数据库)
let apiKeys = [];
let usageRecords = [];

export const storage = {
  // API密钥操作
  getApiKeys: () => apiKeys,
  addApiKey: (key) => {
    apiKeys.push(key);
    return key;
  },
  updateApiKey: (id, updates) => {
    const index = apiKeys.findIndex(key => key.id === id);
    if (index !== -1) {
      apiKeys[index] = { ...apiKeys[index], ...updates };
      return apiKeys[index];
    }
    return null;
  },
  deleteApiKey: (id) => {
    const index = apiKeys.findIndex(key => key.id === id);
    if (index !== -1) {
      return apiKeys.splice(index, 1)[0];
    }
    return null;
  },
  findApiKey: (key) => {
    return apiKeys.find(k => k.key === key && k.status === 'active');
  },
  
  // 使用记录操作
  getUsageRecords: () => usageRecords,
  addUsageRecord: (record) => {
    usageRecords.push(record);
    return record;
  },
  
  // 清空数据 (仅用于测试)
  clear: () => {
    apiKeys = [];
    usageRecords = [];
  }
}; 