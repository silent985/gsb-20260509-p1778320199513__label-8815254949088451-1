import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import Register from './Register.vue';
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

const routes = [
  { path: '/register', component: Register },
  { path: '/login', component: { template: '<div>Login</div>' } }
];

describe('Register 组件', () => {
  let wrapper: any;
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockElMessageSuccess.mockClear();
    mockElMessageError.mockClear();

    mockCryptoUtils.getToken.mockReturnValue(null);
    mockCryptoUtils.getUserInfo.mockReturnValue(null);
    mockCryptoUtils.encryptPassword.mockReturnValue('encrypted-password-123');

    mockApiService.register.mockResolvedValue({
      message: '注册成功'
    });

    router = createRouter({
      history: createWebHistory(),
      routes
    });

    router.push('/register');
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('应该正确渲染注册表单', () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    expect(wrapper.find('h1.title').text()).toBe('用户注册');
    expect(wrapper.find('input#phone').exists()).toBe(true);
    expect(wrapper.find('input#email').exists()).toBe(true);
    expect(wrapper.find('input#idCard').exists()).toBe(true);
    expect(wrapper.find('input#address').exists()).toBe(true);
    expect(wrapper.find('input#password').exists()).toBe(true);
    expect(wrapper.find('input#confirmPassword').exists()).toBe(true);
    expect(wrapper.find('button.register-btn').text()).toBe('注册');
  });

  it('应该在输入无效手机号码时显示错误', async () => {
    wrapper = mount(Register, {
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
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    const phoneInput = wrapper.find('input#phone');
    await phoneInput.setValue('13800138000');
    await phoneInput.trigger('blur');

    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('应该在输入无效电子邮箱时显示错误', async () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    const emailInput = wrapper.find('input#email');
    await emailInput.setValue('invalid');
    await emailInput.trigger('blur');

    expect(wrapper.find('.error-message').text()).toContain('请输入正确的电子邮箱');
  });

  it('应该在输入有效电子邮箱时不显示错误', async () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    const emailInput = wrapper.find('input#email');
    await emailInput.setValue('test@example.com');
    await emailInput.trigger('blur');

    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('应该在输入无效身份证号时显示错误', async () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    const idCardInput = wrapper.find('input#idCard');
    await idCardInput.setValue('invalid');
    await idCardInput.trigger('blur');

    expect(wrapper.find('.error-message').text()).toContain('请输入正确的身份证号');
  });

  it('应该在输入有效身份证号时不显示错误', async () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    const idCardInput = wrapper.find('input#idCard');
    await idCardInput.setValue('110101199003074518');
    await idCardInput.trigger('blur');

    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('应该在地址为空时显示错误', async () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    const addressInput = wrapper.find('input#address');
    await addressInput.setValue('');
    await addressInput.trigger('blur');

    expect(wrapper.find('.error-message').text()).toContain('请输入地址');
  });

  it('应该在地址不为空时不显示错误', async () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    const addressInput = wrapper.find('input#address');
    await addressInput.setValue('北京市朝阳区');
    await addressInput.trigger('blur');

    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('应该在输入无效密码时显示错误', async () => {
    wrapper = mount(Register, {
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
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    const passwordInput = wrapper.find('input#password');
    await passwordInput.setValue('Abc12345');
    await passwordInput.trigger('blur');

    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('应该在两次密码不一致时显示错误', async () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#password').setValue('Abc12345');
    const confirmPasswordInput = wrapper.find('input#confirmPassword');
    await confirmPasswordInput.setValue('Abc12346');
    await confirmPasswordInput.trigger('blur');

    expect(wrapper.find('.error-message').text()).toContain('两次输入的密码不一致');
  });

  it('应该在两次密码一致时不显示错误', async () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#password').setValue('Abc12345');
    const confirmPasswordInput = wrapper.find('input#confirmPassword');
    await confirmPasswordInput.setValue('Abc12345');
    await confirmPasswordInput.trigger('blur');

    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('应该在表单无效时阻止注册', async () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    const form = wrapper.find('form');
    await form.trigger('submit');

    expect(mockApiService.register).not.toHaveBeenCalled();
    expect(mockElMessageSuccess).not.toHaveBeenCalled();
  });

  it('应该在表单有效时成功注册', async () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#phone').setValue('13800138000');
    await wrapper.find('input#email').setValue('test@example.com');
    await wrapper.find('input#idCard').setValue('110101199003074518');
    await wrapper.find('input#address').setValue('北京市朝阳区');
    await wrapper.find('input#password').setValue('Abc12345');
    await wrapper.find('input#confirmPassword').setValue('Abc12345');

    const form = wrapper.find('form');
    await form.trigger('submit');

    expect(mockCryptoUtils.encryptPassword).toHaveBeenCalledWith('Abc12345');
    expect(mockApiService.register).toHaveBeenCalledWith({
      phone: '13800138000',
      email: 'test@example.com',
      idCard: '110101199003074518',
      address: '北京市朝阳区',
      password: 'encrypted-password-123'
    });

    await wrapper.vm.$nextTick();
    
    expect(mockElMessageSuccess).toHaveBeenCalledWith('注册成功，请登录');
  });

  it('应该在注册失败时显示错误消息', async () => {
    const error = {
      response: {
        data: {
          message: '该手机号已被注册'
        }
      }
    };
    mockApiService.register.mockRejectedValue(error);

    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#phone').setValue('13800138000');
    await wrapper.find('input#email').setValue('test@example.com');
    await wrapper.find('input#idCard').setValue('110101199003074518');
    await wrapper.find('input#address').setValue('北京市朝阳区');
    await wrapper.find('input#password').setValue('Abc12345');
    await wrapper.find('input#confirmPassword').setValue('Abc12345');

    const form = wrapper.find('form');
    await form.trigger('submit');

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockElMessageError).toHaveBeenCalledWith('该手机号已被注册');
  });

  it('应该在注册过程中禁用注册按钮', async () => {
    mockApiService.register.mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => resolve({ message: '注册成功' }), 100);
      })
    );

    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#phone').setValue('13800138000');
    await wrapper.find('input#email').setValue('test@example.com');
    await wrapper.find('input#idCard').setValue('110101199003074518');
    await wrapper.find('input#address').setValue('北京市朝阳区');
    await wrapper.find('input#password').setValue('Abc12345');
    await wrapper.find('input#confirmPassword').setValue('Abc12345');

    const form = wrapper.find('form');
    const registerBtn = wrapper.find('button.register-btn');
    
    await form.trigger('submit');
    await wrapper.vm.$nextTick();

    expect(registerBtn.attributes('disabled')).toBeDefined();
    expect(registerBtn.text()).toContain('注册中...');

    await new Promise(resolve => setTimeout(resolve, 200));
    await wrapper.vm.$nextTick();

    expect(registerBtn.attributes('disabled')).toBeUndefined();
    expect(registerBtn.text()).toBe('注册');
  });

  it('应该显示登录链接', () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    const loginLink = wrapper.find('a.link');
    expect(loginLink.text()).toBe('立即登录');
    expect(loginLink.attributes('href')).toBe('/login');
  });

  it('应该检测到多个字段的验证错误', async () => {
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#phone').setValue('invalid');
    await wrapper.find('input#email').setValue('invalid');
    await wrapper.find('input#password').setValue('weak');
    await wrapper.find('input#confirmPassword').setValue('different');

    const form = wrapper.find('form');
    await form.trigger('submit');

    const errorMessages = wrapper.findAll('.error-message');
    expect(errorMessages.length).toBeGreaterThan(0);
  });
});
