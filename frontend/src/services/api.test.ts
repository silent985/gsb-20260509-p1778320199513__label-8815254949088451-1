import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as cryptoUtils from '../utils/crypto';
import { ElMessage } from 'element-plus';

vi.mock('../utils/crypto');
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  }
}));

const mockCryptoUtils = vi.mocked(cryptoUtils);
const mockElMessage = vi.mocked(ElMessage);

describe('API 服务和拦截器', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('请求拦截器', () => {
    it('应该在有 token 时添加 Authorization header', async () => {
      const mockToken = 'mock-jwt-token-123456';
      mockCryptoUtils.getToken.mockReturnValue(mockToken);

      const apiModule = await import('./api');
      const api = apiModule.default;

      const testConfig = {
        url: '/test',
        method: 'get',
        headers: {}
      };

      const requestHandler = (api.interceptors.request as any).handlers[0].fulfilled;
      const result = requestHandler(testConfig);
      
      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('应该在没有 token 时不添加 Authorization header', async () => {
      mockCryptoUtils.getToken.mockReturnValue(null);

      const apiModule = await import('./api');
      const api = apiModule.default;

      const testConfig = {
        url: '/test',
        method: 'get',
        headers: {}
      };

      const requestHandler = (api.interceptors.request as any).handlers[0].fulfilled;
      const result = requestHandler(testConfig);
      
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('应该处理请求错误', async () => {
      const apiModule = await import('./api');
      const api = apiModule.default;

      const mockError = new Error('Request error');
      
      const errorHandler = (api.interceptors.request as any).handlers[0].rejected;
      
      await expect(errorHandler(mockError)).rejects.toThrow('Request error');
    });
  });

  describe('响应拦截器', () => {
    it('应该直接返回响应数据', async () => {
      const apiModule = await import('./api');
      const api = apiModule.default;

      const mockResponse = {
        data: {
          success: true,
          message: 'OK'
        }
      };

      const responseHandler = (api.interceptors.response as any).handlers[0].fulfilled;
      const result = responseHandler(mockResponse);
      
      expect(result).toEqual(mockResponse.data);
    });

    it('应该处理 401 未授权错误', async () => {
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true
      });

      const apiModule = await import('./api');
      const api = apiModule.default;

      const error = {
        response: {
          status: 401,
          data: { message: '未授权' }
        }
      };

      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;
      
      await expect(errorHandler(error)).rejects.toBeDefined();
      expect(window.location.href).toBe('/login');
    });

    it('应该处理 403 禁止访问错误', async () => {
      const apiModule = await import('./api');
      const api = apiModule.default;

      const error = {
        response: {
          status: 403,
          data: { message: '禁止访问' }
        }
      };

      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;
      
      await expect(errorHandler(error)).rejects.toBeDefined();
      expect(mockElMessage.error).toHaveBeenCalledWith('无权限访问');
    });

    it('应该处理 404 资源不存在错误', async () => {
      const apiModule = await import('./api');
      const api = apiModule.default;

      const error = {
        response: {
          status: 404,
          data: { message: '资源不存在' }
        }
      };

      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;
      
      await expect(errorHandler(error)).rejects.toBeDefined();
      expect(mockElMessage.error).toHaveBeenCalledWith('请求的资源不存在');
    });

    it('应该处理 500 服务器错误', async () => {
      const apiModule = await import('./api');
      const api = apiModule.default;

      const error = {
        response: {
          status: 500,
          data: { message: '服务器错误' }
        }
      };

      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;
      
      await expect(errorHandler(error)).rejects.toBeDefined();
      expect(mockElMessage.error).toHaveBeenCalledWith('服务器内部错误');
    });

    it('应该处理其他服务器错误状态码', async () => {
      const apiModule = await import('./api');
      const api = apiModule.default;

      const error = {
        response: {
          status: 400,
          data: { message: '请求参数错误' }
        }
      };

      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;
      
      await expect(errorHandler(error)).rejects.toBeDefined();
      expect(mockElMessage.error).toHaveBeenCalledWith('请求参数错误');
    });

    it('应该处理网络错误（无响应）', async () => {
      const apiModule = await import('./api');
      const api = apiModule.default;

      const error = {
        request: {},
        message: 'Network Error'
      };

      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;
      
      await expect(errorHandler(error)).rejects.toBeDefined();
      expect(mockElMessage.error).toHaveBeenCalledWith('网络错误，请检查网络连接');
    });

    it('应该处理请求配置错误', async () => {
      const apiModule = await import('./api');
      const api = apiModule.default;

      const error = {
        message: '配置错误'
      };

      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;
      
      await expect(errorHandler(error)).rejects.toBeDefined();
      expect(mockElMessage.error).toHaveBeenCalledWith('请求配置错误');
    });
  });

  describe('API 函数', () => {
    beforeEach(async () => {
      vi.resetModules();
    });

    it('login 函数应该返回 mock 数据', async () => {
      const { login } = await import('./api');
      
      const loginData = {
        phone: '13800138000',
        password: 'Abc12345',
        verificationCode: '123456'
      };

      const result = await login(loginData);
      
      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.token.startsWith('mock-jwt-token-')).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.phone).toBe(loginData.phone);
      expect(result.user.nickname).toBe('用户8000');
    });

    it('register 函数应该返回 mock 数据', async () => {
      const { register } = await import('./api');
      
      const registerData = {
        phone: '13800138000',
        email: 'test@example.com',
        idCard: '110101199003074518',
        address: '北京市朝阳区',
        password: 'Abc12345'
      };

      const result = await register(registerData);
      
      expect(result).toEqual({ message: '注册成功' });
    });

    it('sendVerificationCode 函数应该返回 mock 数据', async () => {
      const { sendVerificationCode } = await import('./api');
      
      const data = {
        phone: '13800138000',
        type: 'login'
      };

      const result = await sendVerificationCode(data);
      
      expect(result).toEqual({ message: '验证码发送成功' });
    });

    it('getUserInfo 函数应该返回 mock 数据', async () => {
      const { getUserInfo } = await import('./api');
      
      const result = await getUserInfo();
      
      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.phone).toBe('13800138000');
      expect(result.email).toBe('user@example.com');
      expect(result.nickname).toBe('测试用户');
    });

    it('logout 函数应该返回 mock 数据', async () => {
      const { logout } = await import('./api');
      
      const result = await logout();
      
      expect(result).toEqual({ message: '登出成功' });
    });
  });
});
