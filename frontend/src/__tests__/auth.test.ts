import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../src/store/auth';
import * as api from '../../src/services/api';
import * as crypto from '../../src/utils/crypto';

vi.mock('../../src/services/api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getUserInfo: vi.fn(),
  logout: vi.fn(),
  sendVerificationCode: vi.fn(),
}));

vi.mock('../../src/utils/crypto', () => ({
  storeToken: vi.fn(),
  removeToken: vi.fn(),
  storeUserInfo: vi.fn(),
  removeUserInfo: vi.fn(),
  getToken: vi.fn(() => null),
  getUserInfo: vi.fn(() => null),
  encryptPassword: vi.fn((p: string) => `encrypted_${p}`),
  generateRandomString: vi.fn(() => 'mockrandom'),
  generateVerificationCode: vi.fn(() => '123456'),
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    (crypto.getToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (crypto.getUserInfo as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  describe('initial state', () => {
    it('should have null userInfo when no stored data', () => {
      const store = useAuthStore();
      expect(store.getUserInfo).toBeNull();
    });

    it('should have null token when no stored data', () => {
      const store = useAuthStore();
      expect(store.getToken).toBeNull();
    });

    it('should not be loading initially', () => {
      const store = useAuthStore();
      expect(store.getIsLoading).toBe(false);
    });

    it('should not be authenticated initially', () => {
      const store = useAuthStore();
      expect(store.getIsAuthenticated).toBe(false);
    });

    it('should be authenticated when token exists in storage', () => {
      (crypto.getToken as ReturnType<typeof vi.fn>).mockReturnValue('existing-token');
      const newPinia = createPinia();
      setActivePinia(newPinia);
      const store = useAuthStore();
      expect(store.getIsAuthenticated).toBe(true);
      expect(store.getToken).toBe('existing-token');
    });
  });

  describe('login action', () => {
    it('should update state on successful login', async () => {
      const mockResponse = {
        token: 'test-token',
        user: {
          id: '1',
          phone: '13800138000',
          email: 'test@example.com',
          nickname: '测试用户',
          avatar: 'https://example.com/avatar.png',
          status: 'active',
        },
      };
      (api.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const store = useAuthStore();
      await store.login({
        phone: '13800138000',
        password: 'Password1',
        verificationCode: '123456',
      });

      expect(store.getToken).toBe('test-token');
      expect(store.getUserInfo).toEqual(mockResponse.user);
      expect(store.getIsAuthenticated).toBe(true);
      expect(store.getIsLoading).toBe(false);
    });

    it('should store token and user info on login', async () => {
      const mockResponse = {
        token: 'test-token',
        user: {
          id: '1',
          phone: '13800138000',
          email: 'test@example.com',
          nickname: '测试用户',
          avatar: 'https://example.com/avatar.png',
          status: 'active',
        },
      };
      (api.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const store = useAuthStore();
      await store.login({
        phone: '13800138000',
        password: 'Password1',
        verificationCode: '123456',
      });

      expect(crypto.storeToken).toHaveBeenCalledWith('test-token');
      expect(crypto.storeUserInfo).toHaveBeenCalledWith(mockResponse.user);
    });

    it('should set isLoading to true during login and false after', async () => {
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      (api.login as ReturnType<typeof vi.fn>).mockReturnValue(loginPromise);

      const store = useAuthStore();
      const loginAction = store.login({
        phone: '13800138000',
        password: 'Password1',
        verificationCode: '123456',
      });

      expect(store.getIsLoading).toBe(true);

      resolveLogin!({
        token: 'test-token',
        user: { id: '1', phone: '13800138000', email: 'test@example.com', nickname: 'Test', avatar: '', status: 'active' },
      });

      await loginAction;
      expect(store.getIsLoading).toBe(false);
    });

    it('should set isLoading to false on login failure', async () => {
      (api.login as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Login failed'));

      const store = useAuthStore();

      await expect(
        store.login({
          phone: '13800138000',
          password: 'wrong',
          verificationCode: '123456',
        })
      ).rejects.toThrow('Login failed');

      expect(store.getIsLoading).toBe(false);
      expect(store.getIsAuthenticated).toBe(false);
    });

    it('should not update authentication state on login failure', async () => {
      (api.login as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Login failed'));

      const store = useAuthStore();
      await expect(
        store.login({
          phone: '13800138000',
          password: 'wrong',
          verificationCode: '123456',
        })
      ).rejects.toThrow();

      expect(store.getToken).toBeNull();
      expect(store.getIsAuthenticated).toBe(false);
    });

    it('should call api.login with correct parameters', async () => {
      (api.login as ReturnType<typeof vi.fn>).mockResolvedValue({
        token: 't',
        user: { id: '1', phone: '13800138000', email: '', nickname: '', avatar: '', status: 'active' },
      });

      const store = useAuthStore();
      const loginData = {
        phone: '13800138000',
        password: 'Password1',
        verificationCode: '654321',
      };
      await store.login(loginData);

      expect(api.login).toHaveBeenCalledWith(loginData);
    });
  });

  describe('register action', () => {
    it('should call api.register with correct data', async () => {
      (api.register as ReturnType<typeof vi.fn>).mockResolvedValue({ message: '注册成功' });

      const store = useAuthStore();
      const registerData = {
        phone: '13800138000',
        email: 'test@example.com',
        idCard: '110101199001011234',
        address: '北京市',
        password: 'encrypted_Password1',
      };
      await store.register(registerData);

      expect(api.register).toHaveBeenCalledWith(registerData);
    });

    it('should set isLoading during register and reset after', async () => {
      (api.register as ReturnType<typeof vi.fn>).mockResolvedValue({ message: '注册成功' });

      const store = useAuthStore();
      expect(store.getIsLoading).toBe(false);

      const registerPromise = store.register({
        phone: '13800138000',
        email: 'test@example.com',
        idCard: '110101199001011234',
        address: '北京市',
        password: 'encrypted_Password1',
      });

      expect(store.getIsLoading).toBe(true);
      await registerPromise;
      expect(store.getIsLoading).toBe(false);
    });

    it('should set isLoading to false on register failure', async () => {
      (api.register as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Register failed'));

      const store = useAuthStore();
      await expect(
        store.register({
          phone: '13800138000',
          email: 'test@example.com',
          idCard: '110101199001011234',
          address: '北京市',
          password: 'encrypted_Password1',
        })
      ).rejects.toThrow('Register failed');

      expect(store.getIsLoading).toBe(false);
    });
  });

  describe('logout action', () => {
    it('should clear state on logout', async () => {
      (api.login as ReturnType<typeof vi.fn>).mockResolvedValue({
        token: 'test-token',
        user: { id: '1', phone: '13800138000', email: '', nickname: '', avatar: '', status: 'active' },
      });

      const store = useAuthStore();
      await store.login({
        phone: '13800138000',
        password: 'Password1',
        verificationCode: '123456',
      });
      expect(store.getIsAuthenticated).toBe(true);

      (api.logout as ReturnType<typeof vi.fn>).mockResolvedValue({ message: '登出成功' });
      await store.logout();

      expect(store.getToken).toBeNull();
      expect(store.getUserInfo).toBeNull();
      expect(store.getIsAuthenticated).toBe(false);
    });

    it('should remove token and user info from storage on logout', async () => {
      (api.logout as ReturnType<typeof vi.fn>).mockResolvedValue({ message: '登出成功' });

      const store = useAuthStore();
      await store.logout();

      expect(crypto.removeToken).toHaveBeenCalled();
      expect(crypto.removeUserInfo).toHaveBeenCalled();
    });

    it('should clear state even if logout API fails', async () => {
      (api.logout as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Logout API failed'));

      const store = useAuthStore();
      await store.logout();

      expect(store.getToken).toBeNull();
      expect(store.getUserInfo).toBeNull();
      expect(store.getIsAuthenticated).toBe(false);
      expect(crypto.removeToken).toHaveBeenCalled();
      expect(crypto.removeUserInfo).toHaveBeenCalled();
    });
  });

  describe('getUserInfo action', () => {
    it('should update userInfo on successful fetch', async () => {
      const mockUser = {
        id: '1',
        phone: '13800138000',
        email: 'user@example.com',
        nickname: '测试用户',
        avatar: 'https://example.com/avatar.png',
        status: 'active',
      };
      (api.getUserInfo as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      const store = useAuthStore();
      const result = await store.fetchUserInfo();

      expect(store.userInfo).toEqual(mockUser);
      expect(crypto.storeUserInfo).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should set isLoading to false after getUserInfo failure', async () => {
      (api.getUserInfo as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed'));

      const store = useAuthStore();
      await expect(store.fetchUserInfo()).rejects.toThrow();
      expect(store.getIsLoading).toBe(false);
    });
  });

  describe('clearState action', () => {
    it('should reset all auth state', () => {
      (crypto.getToken as ReturnType<typeof vi.fn>).mockReturnValue('existing-token');
      const newPinia = createPinia();
      setActivePinia(newPinia);

      const store = useAuthStore();
      expect(store.getIsAuthenticated).toBe(true);

      store.clearState();

      expect(store.getToken).toBeNull();
      expect(store.getUserInfo).toBeNull();
      expect(store.getIsAuthenticated).toBe(false);
      expect(crypto.removeToken).toHaveBeenCalled();
      expect(crypto.removeUserInfo).toHaveBeenCalled();
    });
  });
});
