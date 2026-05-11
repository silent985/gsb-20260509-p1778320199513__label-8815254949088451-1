import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../store/auth';
import * as api from '../services/api';
import * as crypto from '../utils/crypto';

vi.mock('../services/api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getUserInfo: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../utils/crypto', () => ({
  storeToken: vi.fn(),
  removeToken: vi.fn(),
  storeUserInfo: vi.fn(),
  removeUserInfo: vi.fn(),
  getToken: vi.fn(),
  getUserInfo: vi.fn(),
}));

const mockUser = {
  id: '1',
  phone: '13800138000',
  email: 'test@example.com',
  nickname: '测试用户',
  avatar: 'https://example.com/avatar.png',
  status: 'active',
};

const mockToken = 'mock-jwt-token-12345';

describe('Auth Store - Pinia状态管理', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    (crypto.getToken as any).mockReturnValue(null);
    (crypto.getUserInfo as any).mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('初始状态', () => {
    it('应该初始化未认证状态', () => {
      const store = useAuthStore();
      
      expect(store.token).toBeNull();
      expect(store.userInfo).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.isAuthenticated).toBe(false);
    });

    it('应该从localStorage恢复认证状态', () => {
      (crypto.getToken as any).mockReturnValue(mockToken);
      (crypto.getUserInfo as any).mockReturnValue(mockUser);
      
      const store = useAuthStore();
      
      expect(store.token).toBe(mockToken);
      expect(store.userInfo).toEqual(mockUser);
      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe('登录流程', () => {
    it('应该成功登录并更新状态', async () => {
      const loginData = {
        phone: '13800138000',
        password: 'Password123',
        verificationCode: '123456',
      };
      
      (api.login as any).mockResolvedValue({
        token: mockToken,
        user: mockUser,
      });
      
      const store = useAuthStore();
      
      expect(store.isLoading).toBe(false);
      
      const promise = store.login(loginData);
      
      expect(store.isLoading).toBe(true);
      
      const result = await promise;
      
      expect(api.login).toHaveBeenCalledWith(loginData);
      expect(crypto.storeToken).toHaveBeenCalledWith(mockToken);
      expect(crypto.storeUserInfo).toHaveBeenCalledWith(mockUser);
      expect(store.token).toBe(mockToken);
      expect(store.userInfo).toEqual(mockUser);
      expect(store.isAuthenticated).toBe(true);
      expect(store.isLoading).toBe(false);
      expect(result.token).toBe(mockToken);
      expect(result.user).toEqual(mockUser);
    });

    it('应该处理登录失败', async () => {
      const loginData = {
        phone: '13800138000',
        password: 'wrong-password',
        verificationCode: '123456',
      };
      
      const mockError = new Error('登录失败');
      (api.login as any).mockRejectedValue(mockError);
      
      const store = useAuthStore();
      
      await expect(store.login(loginData)).rejects.toThrow('登录失败');
      
      expect(api.login).toHaveBeenCalledWith(loginData);
      expect(crypto.storeToken).not.toHaveBeenCalled();
      expect(crypto.storeUserInfo).not.toHaveBeenCalled();
      expect(store.token).toBeNull();
      expect(store.userInfo).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
    });
  });

  describe('注册流程', () => {
    it('应该成功注册', async () => {
      const registerData = {
        phone: '13800138000',
        email: 'test@example.com',
        idCard: '110101199001011234',
        address: '北京市朝阳区',
        password: 'encrypted-password',
      };
      
      (api.register as any).mockResolvedValue({
        message: '注册成功',
      });
      
      const store = useAuthStore();
      
      expect(store.isLoading).toBe(false);
      
      const promise = store.register(registerData);
      
      expect(store.isLoading).toBe(true);
      
      const result = await promise;
      
      expect(api.register).toHaveBeenCalledWith(registerData);
      expect(store.isLoading).toBe(false);
      expect(result.message).toBe('注册成功');
      expect(store.isAuthenticated).toBe(false);
    });

    it('应该处理注册失败', async () => {
      const registerData = {
        phone: '13800138000',
        email: 'test@example.com',
        idCard: '110101199001011234',
        address: '北京市朝阳区',
        password: 'encrypted-password',
      };
      
      const mockError = new Error('手机号已注册');
      (api.register as any).mockRejectedValue(mockError);
      
      const store = useAuthStore();
      
      await expect(store.register(registerData)).rejects.toThrow('手机号已注册');
      
      expect(api.register).toHaveBeenCalledWith(registerData);
      expect(store.isLoading).toBe(false);
    });
  });

  describe('获取用户信息', () => {
    it('应该成功获取并更新用户信息', async () => {
      (api.getUserInfo as any).mockResolvedValue(mockUser);
      
      const store = useAuthStore();
      
      expect(store.isLoading).toBe(false);
      
      const promise = store.fetchUserInfo();
      
      expect(store.isLoading).toBe(true);
      
      const result = await promise;
      
      expect(api.getUserInfo).toHaveBeenCalled();
      expect(crypto.storeUserInfo).toHaveBeenCalledWith(mockUser);
      expect(store.userInfo).toEqual(mockUser);
      expect(store.isLoading).toBe(false);
      expect(result).toEqual(mockUser);
    });

    it('应该处理获取用户信息失败', async () => {
      const mockError = new Error('获取用户信息失败');
      (api.getUserInfo as any).mockRejectedValue(mockError);
      
      const store = useAuthStore();
      
      await expect(store.fetchUserInfo()).rejects.toThrow('获取用户信息失败');
      
      expect(api.getUserInfo).toHaveBeenCalled();
      expect(crypto.storeUserInfo).not.toHaveBeenCalled();
      expect(store.isLoading).toBe(false);
    });
  });

  describe('登出流程', () => {
    it('应该成功登出并清除状态', async () => {
      (api.logout as any).mockResolvedValue({ message: '登出成功' });
      
      const store = useAuthStore();
      store.token = mockToken;
      store.userInfo = mockUser;
      store.isAuthenticated = true;
      
      expect(store.isLoading).toBe(false);
      
      const promise = store.logout();
      
      expect(store.isLoading).toBe(true);
      
      await promise;
      
      expect(api.logout).toHaveBeenCalled();
      expect(crypto.removeToken).toHaveBeenCalled();
      expect(crypto.removeUserInfo).toHaveBeenCalled();
      expect(store.token).toBeNull();
      expect(store.userInfo).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
    });

    it('登出失败时也应该清除状态', async () => {
      const mockError = new Error('登出失败');
      (api.logout as any).mockRejectedValue(mockError);
      
      const store = useAuthStore();
      store.token = mockToken;
      store.userInfo = mockUser;
      store.isAuthenticated = true;
      
      await store.logout();
      
      expect(api.logout).toHaveBeenCalled();
      expect(crypto.removeToken).toHaveBeenCalled();
      expect(crypto.removeUserInfo).toHaveBeenCalled();
      expect(store.token).toBeNull();
      expect(store.userInfo).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
    });
  });

  describe('清除状态', () => {
    it('应该清除所有状态和存储', () => {
      const store = useAuthStore();
      store.token = mockToken;
      store.userInfo = mockUser;
      store.isAuthenticated = true;
      
      store.clearState();
      
      expect(crypto.removeToken).toHaveBeenCalled();
      expect(crypto.removeUserInfo).toHaveBeenCalled();
      expect(store.token).toBeNull();
      expect(store.userInfo).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('Getters', () => {
    it('getUserInfo应该返回用户信息', () => {
      const store = useAuthStore();
      store.userInfo = mockUser;
      
      expect(store.getUserInfo).toEqual(mockUser);
    });

    it('getToken应该返回token', () => {
      const store = useAuthStore();
      store.token = mockToken;
      
      expect(store.getToken).toBe(mockToken);
    });

    it('getIsLoading应该返回加载状态', () => {
      const store = useAuthStore();
      
      expect(store.getIsLoading).toBe(false);
      store.isLoading = true;
      expect(store.getIsLoading).toBe(true);
    });

    it('getIsAuthenticated应该返回认证状态', () => {
      const store = useAuthStore();
      
      expect(store.getIsAuthenticated).toBe(false);
      store.isAuthenticated = true;
      expect(store.getIsAuthenticated).toBe(true);
    });
  });
});
