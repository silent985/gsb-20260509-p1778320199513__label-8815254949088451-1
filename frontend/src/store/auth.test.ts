import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './auth';
import * as apiService from '../services/api';
import * as cryptoUtils from '../utils/crypto';

vi.mock('../services/api');
vi.mock('../utils/crypto');

const mockApiService = vi.mocked(apiService);
const mockCryptoUtils = vi.mocked(cryptoUtils);

const mockUser = {
  id: '1',
  phone: '13800138000',
  email: 'user@example.com',
  nickname: '测试用户',
  avatar: 'https://example.com/avatar.png',
  status: 'active'
};

const mockToken = 'mock-jwt-token-123456';

describe('Auth Store - 认证状态管理', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    mockCryptoUtils.getToken.mockReturnValue(null);
    mockCryptoUtils.getUserInfo.mockReturnValue(null);
  });

  describe('初始状态', () => {
    it('应该初始化正确的默认状态', () => {
      const store = useAuthStore();
      
      expect(store.token).toBeNull();
      expect(store.userInfo).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.isAuthenticated).toBe(false);
    });

    it('应该从 localStorage 恢复已登录状态', () => {
      mockCryptoUtils.getToken.mockReturnValue(mockToken);
      mockCryptoUtils.getUserInfo.mockReturnValue(mockUser);
      
      const store = useAuthStore();
      
      expect(store.token).toBe(mockToken);
      expect(store.userInfo).toEqual(mockUser);
      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe('Getters', () => {
    it('getUserInfo 应该返回正确的用户信息', () => {
      mockCryptoUtils.getUserInfo.mockReturnValue(mockUser);
      const store = useAuthStore();
      expect(store.getUserInfo).toEqual(mockUser);
    });

    it('getToken 应该返回正确的 token', () => {
      mockCryptoUtils.getToken.mockReturnValue(mockToken);
      const store = useAuthStore();
      expect(store.getToken).toBe(mockToken);
    });

    it('getIsLoading 应该返回正确的加载状态', () => {
      const store = useAuthStore();
      expect(store.getIsLoading).toBe(false);
    });

    it('getIsAuthenticated 应该返回正确的认证状态', () => {
      const store = useAuthStore();
      expect(store.getIsAuthenticated).toBe(false);
    });
  });

  describe('Actions', () => {
    describe('login - 登录', () => {
      const loginData = {
        phone: '13800138000',
        password: 'Abc12345',
        verificationCode: '123456'
      };

      it('应该成功登录并更新状态', async () => {
        mockApiService.login.mockResolvedValue({
          token: mockToken,
          user: mockUser
        });

        const store = useAuthStore();
        const result = await store.login(loginData);

        expect(store.isLoading).toBe(false);
        expect(store.token).toBe(mockToken);
        expect(store.userInfo).toEqual(mockUser);
        expect(store.isAuthenticated).toBe(true);
        expect(result).toEqual({ token: mockToken, user: mockUser });
        expect(mockCryptoUtils.storeToken).toHaveBeenCalledWith(mockToken);
        expect(mockCryptoUtils.storeUserInfo).toHaveBeenCalledWith(mockUser);
      });

      it('应该在登录过程中设置加载状态', async () => {
        mockApiService.login.mockImplementation(
          () => new Promise((resolve) => {
            setTimeout(() => resolve({ token: mockToken, user: mockUser }), 10);
          })
        );

        const store = useAuthStore();
        const promise = store.login(loginData);
        
        expect(store.isLoading).toBe(true);
        await promise;
        expect(store.isLoading).toBe(false);
      });

      it('应该在登录失败时抛出错误并保持未认证状态', async () => {
        const error = new Error('登录失败');
        mockApiService.login.mockRejectedValue(error);

        const store = useAuthStore();
        
        await expect(store.login(loginData)).rejects.toThrow('登录失败');
        expect(store.isLoading).toBe(false);
        expect(store.isAuthenticated).toBe(false);
        expect(store.token).toBeNull();
      });
    });

    describe('register - 注册', () => {
      const registerData = {
        phone: '13800138000',
        email: 'test@example.com',
        idCard: '110101199003074518',
        address: '北京市朝阳区',
        password: 'Abc12345'
      };

      it('应该成功注册并返回响应', async () => {
        const mockResponse = { message: '注册成功' };
        mockApiService.register.mockResolvedValue(mockResponse);

        const store = useAuthStore();
        const result = await store.register(registerData);

        expect(store.isLoading).toBe(false);
        expect(result).toEqual(mockResponse);
      });

      it('应该在注册过程中设置加载状态', async () => {
        mockApiService.register.mockImplementation(
          () => new Promise((resolve) => {
            setTimeout(() => resolve({ message: '注册成功' }), 10);
          })
        );

        const store = useAuthStore();
        const promise = store.register(registerData);
        
        expect(store.isLoading).toBe(true);
        await promise;
        expect(store.isLoading).toBe(false);
      });

      it('应该在注册失败时抛出错误', async () => {
        const error = new Error('注册失败');
        mockApiService.register.mockRejectedValue(error);

        const store = useAuthStore();
        
        await expect(store.register(registerData)).rejects.toThrow('注册失败');
        expect(store.isLoading).toBe(false);
      });
    });

    describe('fetchUserInfo - 获取用户信息', () => {
      it('应该成功获取并更新用户信息', async () => {
        mockApiService.getUserInfo.mockResolvedValue(mockUser);

        const store = useAuthStore();
        const result = await store.fetchUserInfo();

        expect(store.isLoading).toBe(false);
        expect(store.userInfo).toEqual(mockUser);
        expect(result).toEqual(mockUser);
        expect(mockCryptoUtils.storeUserInfo).toHaveBeenCalledWith(mockUser);
      });

      it('应该在获取过程中设置加载状态', async () => {
        mockApiService.getUserInfo.mockImplementation(
          () => new Promise((resolve) => {
            setTimeout(() => resolve(mockUser), 10);
          })
        );

        const store = useAuthStore();
        const promise = store.fetchUserInfo();
        
        expect(store.isLoading).toBe(true);
        await promise;
        expect(store.isLoading).toBe(false);
      });

      it('应该在获取失败时抛出错误', async () => {
        const error = new Error('获取用户信息失败');
        mockApiService.getUserInfo.mockRejectedValue(error);

        const store = useAuthStore();
        
        await expect(store.fetchUserInfo()).rejects.toThrow('获取用户信息失败');
        expect(store.isLoading).toBe(false);
      });
    });

    describe('logout - 登出', () => {
      it('应该成功登出并清除状态', async () => {
        mockCryptoUtils.getToken.mockReturnValue(mockToken);
        mockCryptoUtils.getUserInfo.mockReturnValue(mockUser);
        mockApiService.logout.mockResolvedValue({ message: '登出成功' });

        const store = useAuthStore();
        expect(store.isAuthenticated).toBe(true);
        
        await store.logout();

        expect(store.isLoading).toBe(false);
        expect(store.token).toBeNull();
        expect(store.userInfo).toBeNull();
        expect(store.isAuthenticated).toBe(false);
        expect(mockCryptoUtils.removeToken).toHaveBeenCalled();
        expect(mockCryptoUtils.removeUserInfo).toHaveBeenCalled();
      });

      it('应该在登出过程中设置加载状态', async () => {
        mockApiService.logout.mockImplementation(
          () => new Promise((resolve) => {
            setTimeout(() => resolve({ message: '登出成功' }), 10);
          })
        );

        const store = useAuthStore();
        const promise = store.logout();
        
        expect(store.isLoading).toBe(true);
        await promise;
        expect(store.isLoading).toBe(false);
      });

      it('应该在登出失败时仍然清除状态', async () => {
        const error = new Error('登出失败');
        mockApiService.logout.mockRejectedValue(error);
        mockCryptoUtils.getToken.mockReturnValue(mockToken);

        const store = useAuthStore();
        expect(store.isAuthenticated).toBe(true);
        
        await store.logout();

        expect(store.isAuthenticated).toBe(false);
        expect(store.token).toBeNull();
        expect(store.userInfo).toBeNull();
        expect(mockCryptoUtils.removeToken).toHaveBeenCalled();
        expect(mockCryptoUtils.removeUserInfo).toHaveBeenCalled();
      });
    });

    describe('clearState - 清除状态', () => {
      it('应该清除所有认证状态', () => {
        mockCryptoUtils.getToken.mockReturnValue(mockToken);
        mockCryptoUtils.getUserInfo.mockReturnValue(mockUser);

        const store = useAuthStore();
        expect(store.isAuthenticated).toBe(true);
        
        store.clearState();

        expect(store.token).toBeNull();
        expect(store.userInfo).toBeNull();
        expect(store.isAuthenticated).toBe(false);
        expect(mockCryptoUtils.removeToken).toHaveBeenCalled();
        expect(mockCryptoUtils.removeUserInfo).toHaveBeenCalled();
      });
    });
  });
});
