import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api from '../services/api';
import * as crypto from '../utils/crypto';
import { ElMessage } from 'element-plus';

vi.mock('../utils/crypto', () => ({
  getToken: vi.fn(),
  storeToken: vi.fn(),
  removeToken: vi.fn(),
  storeUserInfo: vi.fn(),
  removeUserInfo: vi.fn(),
  getUserInfo: vi.fn(),
}));

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe('API Service - 请求拦截与响应处理', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
    vi.clearAllMocks();
    window.location.href = '';
  });

  afterEach(() => {
    mock.restore();
  });

  describe('请求拦截器', () => {
    it('应该在有token时添加Authorization头', async () => {
      const mockToken = 'test-jwt-token';
      (crypto.getToken as any).mockReturnValue(mockToken);

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe(`Bearer ${mockToken}`);
        return [200, { success: true }];
      });

      await api.get('/test');
    });

    it('没有token时不添加Authorization头', async () => {
      (crypto.getToken as any).mockReturnValue(null);

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { success: true }];
      });

      await api.get('/test');
    });
  });

  describe('响应拦截器', () => {
    it('应该正确返回响应数据', async () => {
      const responseData = { id: 1, name: 'test' };
      mock.onGet('/test').reply(200, responseData);

      const result = await api.get('/test');
      expect(result).toEqual(responseData);
    });

    it('处理401未授权错误', async () => {
      mock.onGet('/test').reply(401, { message: '未授权' });

      await expect(api.get('/test')).rejects.toThrow();
      expect(window.location.href).toBe('/login');
    });

    it('处理403禁止访问错误', async () => {
      mock.onGet('/test').reply(403, { message: '无权限' });

      await expect(api.get('/test')).rejects.toThrow();
      expect(ElMessage.error).toHaveBeenCalledWith('无权限访问');
    });

    it('处理404资源不存在错误', async () => {
      mock.onGet('/test').reply(404, { message: '未找到' });

      await expect(api.get('/test')).rejects.toThrow();
      expect(ElMessage.error).toHaveBeenCalledWith('请求的资源不存在');
    });

    it('处理500服务器错误', async () => {
      mock.onGet('/test').reply(500, { message: '服务器错误' });

      await expect(api.get('/test')).rejects.toThrow();
      expect(ElMessage.error).toHaveBeenCalledWith('服务器内部错误');
    });

    it('处理其他错误状态码', async () => {
      mock.onGet('/test').reply(400, { message: '请求参数错误' });

      await expect(api.get('/test')).rejects.toThrow();
      expect(ElMessage.error).toHaveBeenCalledWith('请求参数错误');
    });

    it('处理错误响应中没有message的情况', async () => {
      mock.onGet('/test').reply(400, {});

      await expect(api.get('/test')).rejects.toThrow();
      expect(ElMessage.error).toHaveBeenCalledWith('请求失败');
    });

    it('处理网络错误（无响应）', async () => {
      const networkError = new Error('Network Error');
      (networkError as any).request = {};
      mock.onGet('/test').reply(() => {
        throw networkError;
      });

      await expect(api.get('/test')).rejects.toThrow();
      expect(ElMessage.error).toHaveBeenCalledWith('网络错误，请检查网络连接');
    });
  });

  describe('Mock API 函数', () => {
    it('login函数应该返回模拟数据', async () => {
      const { login } = await import('../services/api');
      
      const loginData = {
        phone: '13800138000',
        password: 'Password123',
        verificationCode: '123456',
      };

      const result = await login(loginData);
      
      expect(result.token).toBeDefined();
      expect(result.token).toContain('mock-jwt-token-');
      expect(result.user).toBeDefined();
      expect(result.user.phone).toBe(loginData.phone);
      expect(result.user.nickname).toBeTruthy();
      expect(result.user.avatar).toBeTruthy();
    });

    it('register函数应该返回模拟数据', async () => {
      const { register } = await import('../services/api');
      
      const registerData = {
        phone: '13800138000',
        email: 'test@example.com',
        idCard: '110101199001011234',
        address: '北京市朝阳区',
        password: 'encrypted-password',
      };

      const result = await register(registerData);
      
      expect(result.message).toBe('注册成功');
    });

    it('sendVerificationCode函数应该返回模拟数据', async () => {
      const { sendVerificationCode } = await import('../services/api');
      
      const result = await sendVerificationCode({ phone: '13800138000', type: 'login' });
      
      expect(result.message).toBe('验证码发送成功');
    });

    it('getUserInfo函数应该返回模拟数据', async () => {
      const { getUserInfo } = await import('../services/api');
      
      const result = await getUserInfo();
      
      expect(result.id).toBe('1');
      expect(result.phone).toBe('13800138000');
      expect(result.email).toBe('user@example.com');
      expect(result.nickname).toBe('测试用户');
    });

    it('logout函数应该返回模拟数据', async () => {
      const { logout } = await import('../services/api');
      
      const result = await logout();
      
      expect(result.message).toBe('登出成功');
    });
  });
});
