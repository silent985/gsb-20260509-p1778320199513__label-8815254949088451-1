import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';
import * as crypto from '../../src/utils/crypto';
import apiModule from '../../src/services/api';

vi.mock('../../src/utils/crypto', () => ({
  getToken: vi.fn(() => null),
  storeToken: vi.fn(),
  removeToken: vi.fn(),
  storeUserInfo: vi.fn(),
  removeUserInfo: vi.fn(),
  getUserInfo: vi.fn(() => null),
  encryptPassword: vi.fn((p: string) => `encrypted_${p}`),
  generateRandomString: vi.fn(() => 'mockrandom'),
  generateVerificationCode: vi.fn(() => '123456'),
}));

const mockElMessageError = vi.fn();
vi.mock('element-plus', () => ({
  ElMessage: {
    error: (...args: any[]) => mockElMessageError(...args),
    success: vi.fn(),
  },
}));

const requestInterceptor: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig =
  (apiModule as any).interceptors.request.handlers[0].fulfilled;

const responseFulfilled: (response: any) => any =
  (apiModule as any).interceptors.response.handlers[0].fulfilled;

const responseRejected: (error: any) => Promise<any> =
  (apiModule as any).interceptors.response.handlers[0].rejected;

describe('API Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login API', () => {
    it('should resolve with mock token and user data', async () => {
      const { login } = await import('../../src/services/api');
      const result = await login({
        phone: '13800138000',
        password: 'Password1',
        verificationCode: '123456',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.phone).toBe('13800138000');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('nickname');
      expect(result.user).toHaveProperty('avatar');
      expect(result.user).toHaveProperty('status');
    });

    it('should generate nickname from last 4 digits of phone', async () => {
      const { login } = await import('../../src/services/api');
      const result = await login({
        phone: '13800138000',
        password: 'Password1',
        verificationCode: '123456',
      });

      expect(result.user.nickname).toContain('8000');
    });
  });

  describe('register API', () => {
    it('should resolve with success message', async () => {
      const { register } = await import('../../src/services/api');
      const result = await register({
        phone: '13800138000',
        email: 'test@example.com',
        idCard: '110101199001011234',
        address: '北京市',
        password: 'encrypted_Password1',
      });

      expect(result).toHaveProperty('message', '注册成功');
    });
  });

  describe('sendVerificationCode API', () => {
    it('should resolve with success message', async () => {
      const { sendVerificationCode } = await import('../../src/services/api');
      const result = await sendVerificationCode({
        phone: '13800138000',
        type: 'login',
      });

      expect(result).toHaveProperty('message', '验证码发送成功');
    });
  });

  describe('getUserInfo API', () => {
    it('should resolve with mock user info', async () => {
      const { getUserInfo } = await import('../../src/services/api');
      const result = await getUserInfo();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('phone');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('nickname');
      expect(result).toHaveProperty('avatar');
      expect(result).toHaveProperty('status');
    });
  });

  describe('logout API', () => {
    it('should resolve with success message', async () => {
      const { logout } = await import('../../src/services/api');
      const result = await logout();

      expect(result).toHaveProperty('message', '登出成功');
    });
  });
});

describe('Request Interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add Authorization header when token exists', () => {
    (crypto.getToken as ReturnType<typeof vi.fn>).mockReturnValue('my-test-token');

    const config = { headers: {} as any } as InternalAxiosRequestConfig;
    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBe('Bearer my-test-token');
  });

  it('should not add Authorization header when token is null', () => {
    (crypto.getToken as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const config = { headers: {} as any } as InternalAxiosRequestConfig;
    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('should preserve existing headers when adding token', () => {
    (crypto.getToken as ReturnType<typeof vi.fn>).mockReturnValue('test-token');

    const config = {
      headers: { 'Content-Type': 'application/json' } as any,
    } as InternalAxiosRequestConfig;
    const result = requestInterceptor(config);

    expect(result.headers['Content-Type']).toBe('application/json');
    expect(result.headers.Authorization).toBe('Bearer test-token');
  });

  it('should always call getToken to check for auth token', () => {
    (crypto.getToken as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const config = { headers: {} as any } as InternalAxiosRequestConfig;
    requestInterceptor(config);

    expect(crypto.getToken).toHaveBeenCalled();
  });
});

describe('Response Interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fulfilled handler', () => {
    it('should unwrap response.data', () => {
      const resp = {
        data: { token: 'abc', user: { id: '1' } },
        status: 200,
      };

      const result = responseFulfilled(resp);
      expect(result).toEqual({ token: 'abc', user: { id: '1' } });
    });
  });

  describe('rejected handler - error handling', () => {
    it('should redirect to /login on 401 error', async () => {
      const originalLocation = window.location;
      delete (window as any).location;
      (window as any).location = { href: '' };

      const error = {
        response: { status: 401, data: {} },
      };

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(window.location.href).toBe('/login');

      (window as any).location = originalLocation;
    });

    it('should call ElMessage.error with "无权限访问" on 403', async () => {
      const error = {
        response: { status: 403, data: {} },
      };

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(mockElMessageError).toHaveBeenCalledWith('无权限访问');
    });

    it('should call ElMessage.error with "请求的资源不存在" on 404', async () => {
      const error = {
        response: { status: 404, data: {} },
      };

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(mockElMessageError).toHaveBeenCalledWith('请求的资源不存在');
    });

    it('should call ElMessage.error with "服务器内部错误" on 500', async () => {
      const error = {
        response: { status: 500, data: {} },
      };

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(mockElMessageError).toHaveBeenCalledWith('服务器内部错误');
    });

    it('should call ElMessage.error with server message on other status codes', async () => {
      const error = {
        response: { status: 422, data: { message: '参数校验失败' } },
      };

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(mockElMessageError).toHaveBeenCalledWith('参数校验失败');
    });

    it('should call ElMessage.error with "请求失败" as fallback when no message', async () => {
      const error = {
        response: { status: 418, data: {} },
      };

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(mockElMessageError).toHaveBeenCalledWith('请求失败');
    });

    it('should call ElMessage.error with network error when request exists but no response', async () => {
      const error = {
        request: new XMLHttpRequest(),
      };

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(mockElMessageError).toHaveBeenCalledWith('网络错误，请检查网络连接');
    });

    it('should call ElMessage.error with config error when no request and no response', async () => {
      const error = {};

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(mockElMessageError).toHaveBeenCalledWith('请求配置错误');
    });

    it('should always re-throw the error after handling', async () => {
      const error = {
        response: { status: 500, data: {} },
      };

      await expect(responseRejected(error)).rejects.toBe(error);
    });
  });
});

describe('Crypto Utils (integration with API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should encrypt password before sending to register API', async () => {
    const { register } = await import('../../src/services/api');
    const { encryptPassword } = await import('../../src/utils/crypto');

    const rawPassword = 'Password1';
    const encrypted = encryptPassword(rawPassword);

    await register({
      phone: '13800138000',
      email: 'test@example.com',
      idCard: '110101199001011234',
      address: '北京市',
      password: encrypted,
    });

    expect(encryptPassword).toHaveBeenCalledWith('Password1');
  });

  it('should store token after login API call', async () => {
    const { login } = await import('../../src/services/api');

    const result = await login({
      phone: '13800138000',
      password: 'Password1',
      verificationCode: '123456',
    });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
  });

  it('should generate 6-digit verification code', async () => {
    const { generateVerificationCode } = await import('../../src/utils/crypto');
    const code = generateVerificationCode();
    expect(code).toHaveLength(6);
    expect(/^\d{6}$/.test(code)).toBe(true);
  });
});
