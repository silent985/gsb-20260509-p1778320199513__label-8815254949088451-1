import axios from 'axios';
import { getToken } from '../utils/crypto';
import { ElMessage } from 'element-plus';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证令牌
    const token = getToken();
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
  (response) => {
    return response.data;
  },
  (error) => {
    // 处理错误
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 401:
          // 未授权，跳转到登录页
          window.location.href = '/login';
          break;
        case 403:
          // 禁止访问
          ElMessage.error('无权限访问');
          break;
        case 404:
          // 资源不存在
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          // 服务器错误
          ElMessage.error('服务器内部错误');
          break;
        default:
          ElMessage.error(error.response.data.message || '请求失败');
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('网络错误，请检查网络连接');
    } else {
      // 请求配置错误
      ElMessage.error('请求配置错误');
    }
    return Promise.reject(error);
  }
);

// 登录API
export const login = (data: { phone: string; password: string; verificationCode: string }) => {
  // 模拟登录成功响应
  return Promise.resolve({
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      id: '1',
      phone: data.phone,
      email: 'user@example.com',
      nickname: '用户' + data.phone.slice(-4),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.phone}`,
      status: 'active'
    }
  });
};

// 注册API
export const register = (data: {
  phone: string;
  email: string;
  idCard: string;
  address: string;
  password: string;
}) => {
  // 模拟注册成功响应
  return Promise.resolve({
    message: '注册成功'
  });
};

// 发送验证码API
export const sendVerificationCode = (data: { phone: string; type: string }) => {
  // 模拟发送验证码成功
  return Promise.resolve({
    message: '验证码发送成功'
  });
};

// 获取用户信息API
export const getUserInfo = () => {
  // 模拟获取用户信息
  return Promise.resolve({
    id: '1',
    phone: '13800138000',
    email: 'user@example.com',
    nickname: '测试用户',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=13800138000',
    status: 'active'
  });
};

// 登出API
export const logout = () => {
  // 模拟登出成功
  return Promise.resolve({
    message: '登出成功'
  });
};

export default api;