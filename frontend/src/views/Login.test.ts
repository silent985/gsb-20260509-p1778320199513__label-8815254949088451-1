import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import Login from './Login.vue';
import { useAuthStore } from '../store/auth';
import * as cryptoUtils from '../utils/crypto';
import * as apiService from '../services/api';

const mockElMessageSuccess = vi.fn();
const mockElMessageError = vi.fn();

vi.mock('../utils/crypto');
vi.mock('../services/api');
vi.mock('element-plus', () => ({
  ElMessage: {
    success: (...args: any[]) => mockElMessageSuccess(...args),
    error: (...args: any[]) => mockElMessageError(...args)
  }
}));

const mockCryptoUtils = vi.mocked(cryptoUtils);
const mockApiService = vi.mocked(apiService);

const mockUser = {
  id: '1',
  phone: '13800138000',
  email: 'user@example.com',
  nickname: '测试用户',
  avatar: 'https://example.com/avatar.png',
  status: 'active'
};

const mockToken = 'mock-jwt-token-123456';

const routes = [
  { path: '/login', component: Login },
  { path: '/home', component: { template: '<div>Home</div>' } }
];

describe('Login 组件', () => {
  let wrapper: any;
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockElMessageSuccess.mockClear();
    mockElMessageError.mockClear();

    mockCryptoUtils.getToken.mockReturnValue(null);
    mockCryptoUtils.getUserInfo.mockReturnValue(null);
    mockCryptoUtils.generateVerificationCode.mockReturnValue('123456');
    mockCryptoUtils.storeToken.mockImplementation(() => {});
    mockCryptoUtils.storeUserInfo.mockImplementation(() => {});

    mockApiService.login.mockResolvedValue({
      token: mockToken,
      user: mockUser
    });
    mockApiService.sendVerificationCode.mockResolvedValue({
      message: '验证码发送成功'
    });

    router = createRouter({
      history: createWebHistory(),
      routes
    });

    router.push('/login');
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('应该正确渲染登录表单', () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    expect(wrapper.find('h1.title').text()).toBe('用户登录');
    expect(wrapper.find('input#phone').exists()).toBe(true);
    expect(wrapper.find('input#password').exists()).toBe(true);
    expect(wrapper.find('input#verificationCode').exists()).toBe(true);
    expect(wrapper.find('button.login-btn').text()).toBe('登录');
    expect(wrapper.find('button.send-code-btn').text()).toBe('发送验证码');
  });

  it('应该在输入无效手机号码时显示错误', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    const phoneInput = wrapper.find('input#phone');
    await phoneInput.setValue('invalid');
    await phoneInput.trigger('blur');

    expect(wrapper.find('.error-message').text()).toContain('请输入正确的手机号码');
  });

  it('应该在输入有效手机号码时不显示错误', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    const phoneInput = wrapper.find('input#phone');
    await phoneInput.setValue('13800138000');
    await phoneInput.trigger('blur');

    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('应该在输入无效密码时显示错误', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    const passwordInput = wrapper.find('input#password');
    await passwordInput.setValue('weak');
    await passwordInput.trigger('blur');

    expect(wrapper.find('.error-message').text()).toContain('密码至少8位，包含字母和数字');
  });

  it('应该在输入有效密码时不显示错误', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    const passwordInput = wrapper.find('input#password');
    await passwordInput.setValue('Abc12345');
    await passwordInput.trigger('blur');

    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('应该在输入无效验证码时显示错误', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    const codeInput = wrapper.find('input#verificationCode');
    await codeInput.setValue('123');
    await codeInput.trigger('blur');

    expect(wrapper.find('.error-message').text()).toContain('验证码为6位数字');
  });

  it('应该在输入有效验证码时不显示错误', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    const codeInput = wrapper.find('input#verificationCode');
    await codeInput.setValue('123456');
    await codeInput.trigger('blur');

    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('应该在点击发送验证码时验证手机号', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    const phoneInput = wrapper.find('input#phone');
    await phoneInput.setValue('invalid');

    const sendCodeBtn = wrapper.find('button.send-code-btn');
    await sendCodeBtn.trigger('click');

    expect(wrapper.find('.error-message').text()).toContain('请输入正确的手机号码');
    expect(mockApiService.sendVerificationCode).not.toHaveBeenCalled();
  });

  it('应该在手机号有效时发送验证码', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    const phoneInput = wrapper.find('input#phone');
    await phoneInput.setValue('13800138000');

    const sendCodeBtn = wrapper.find('button.send-code-btn');
    await sendCodeBtn.trigger('click');

    expect(mockCryptoUtils.generateVerificationCode).toHaveBeenCalled();
  });

  it('应该在验证码发送后显示倒计时', async () => {
    vi.useFakeTimers();
    
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    const phoneInput = wrapper.find('input#phone');
    await phoneInput.setValue('13800138000');

    const sendCodeBtn = wrapper.find('button.send-code-btn');
    await sendCodeBtn.trigger('click');

    expect(sendCodeBtn.text()).toBe('60s后重发');
    expect(sendCodeBtn.attributes('disabled')).toBeDefined();

    vi.advanceTimersByTime(30000);
    await wrapper.vm.$nextTick();
    
    expect(sendCodeBtn.text()).toBe('30s后重发');

    vi.advanceTimersByTime(30000);
    await wrapper.vm.$nextTick();
    
    expect(sendCodeBtn.text()).toBe('发送验证码');
    expect(sendCodeBtn.attributes('disabled')).toBeUndefined();

    vi.useRealTimers();
  });

  it('应该在表单无效时阻止登录', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    const form = wrapper.find('form');
    await form.trigger('submit');

    expect(mockApiService.login).not.toHaveBeenCalled();
    expect(mockElMessageSuccess).not.toHaveBeenCalled();
  });

  it('应该在表单有效时成功登录', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#phone').setValue('13800138000');
    await wrapper.find('input#password').setValue('Abc12345');
    await wrapper.find('input#verificationCode').setValue('123456');

    const form = wrapper.find('form');
    await form.trigger('submit');

    expect(mockApiService.login).toHaveBeenCalledWith({
      phone: '13800138000',
      password: 'Abc12345',
      verificationCode: '123456'
    });

    await wrapper.vm.$nextTick();
    
    const authStore = useAuthStore();
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.token).toBe(mockToken);
    expect(authStore.userInfo).toEqual(mockUser);
    expect(mockElMessageSuccess).toHaveBeenCalledWith('登录成功');
  });

  it('应该在登录失败时显示错误消息', async () => {
    const error = {
      response: {
        data: {
          message: '用户名或密码错误'
        }
      }
    };
    mockApiService.login.mockRejectedValue(error);

    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#phone').setValue('13800138000');
    await wrapper.find('input#password').setValue('Abc12345');
    await wrapper.find('input#verificationCode').setValue('123456');

    const form = wrapper.find('form');
    await form.trigger('submit');

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockElMessageError).toHaveBeenCalledWith('用户名或密码错误');
  });

  it('应该在登录过程中禁用登录按钮', async () => {
    mockApiService.login.mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => resolve({ token: mockToken, user: mockUser }), 100);
      })
    );

    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#phone').setValue('13800138000');
    await wrapper.find('input#password').setValue('Abc12345');
    await wrapper.find('input#verificationCode').setValue('123456');

    const form = wrapper.find('form');
    const loginBtn = wrapper.find('button.login-btn');
    
    await form.trigger('submit');
    await wrapper.vm.$nextTick();

    expect(loginBtn.attributes('disabled')).toBeDefined();
    expect(loginBtn.text()).toContain('登录中...');

    await new Promise(resolve => setTimeout(resolve, 200));
    await wrapper.vm.$nextTick();

    expect(loginBtn.attributes('disabled')).toBeUndefined();
    expect(loginBtn.text()).toBe('登录');
  });

  it('应该显示注册链接', () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    const registerLink = wrapper.find('a.link');
    expect(registerLink.text()).toBe('立即注册');
    expect(registerLink.attributes('href')).toBe('/register');
  });
});
