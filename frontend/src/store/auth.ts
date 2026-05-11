import { defineStore } from 'pinia';
import { login, register, getUserInfo as fetchUserInfo, logout as logoutApi } from '../services/api';
import { storeToken, removeToken, storeUserInfo, removeUserInfo, getToken, getUserInfo as getStoredUserInfo } from '../utils/crypto';

interface UserInfo {
  id: string;
  phone: string;
  email: string;
  nickname: string;
  avatar: string;
  status: string;
  idCard?: string;
  address?: string;
  createdAt?: string;
}

interface AuthState {
  userInfo: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    userInfo: getStoredUserInfo(),
    token: getToken(),
    isLoading: false,
    isAuthenticated: !!getToken(),
  }),
  getters: {
    getUserInfo: (state) => state.userInfo,
    getToken: (state) => state.token,
    getIsLoading: (state) => state.isLoading,
    getIsAuthenticated: (state) => state.isAuthenticated,
  },
  actions: {
    // 登录
    async login(data: { phone: string; password: string; verificationCode: string }) {
      try {
        this.isLoading = true;
        const response = await login(data);
        const { token, user } = response;
        
        // 存储令牌和用户信息
        storeToken(token);
        storeUserInfo(user);
        
        // 更新状态
        this.token = token;
        this.userInfo = user;
        this.isAuthenticated = true;
        
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 注册
    async register(data: {
      phone: string;
      email: string;
      idCard: string;
      address: string;
      password: string;
    }) {
      try {
        this.isLoading = true;
        const response = await register(data);
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      try {
        this.isLoading = true;
        const response = await fetchUserInfo();
        const user = response;
        
        // 存储用户信息
        storeUserInfo(user);
        
        // 更新状态
        this.userInfo = user;
        
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 登出
    async logout() {
      try {
        this.isLoading = true;
        await logoutApi();
      } catch (error) {
        console.error('登出失败:', error);
      } finally {
        // 移除令牌和用户信息
        removeToken();
        removeUserInfo();
        
        // 更新状态
        this.token = null;
        this.userInfo = null;
        this.isAuthenticated = false;
        this.isLoading = false;
      }
    },
    
    // 清除状态
    clearState() {
      removeToken();
      removeUserInfo();
      this.token = null;
      this.userInfo = null;
      this.isAuthenticated = false;
    },
  },
});