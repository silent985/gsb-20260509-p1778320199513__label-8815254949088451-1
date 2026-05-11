import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Register from '../views/Register.vue';
import { useAuthStore } from '../store/auth';
import { ElMessage } from 'element-plus';

vi.mock('../store/auth', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../utils/crypto', () => ({
  encryptPassword: vi.fn((password) => `encrypted-${password}`),
}));

const mockRouter = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/register', component: Register },
    { path: '/login', component: { template: '<div>Login</div>' } },
  ],
});

describe('Register Component - 注册组件', () => {
  let wrapper: any;
  let mockAuthStore: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockAuthStore = {
      register: vi.fn(),
      getIsLoading: false,
    };
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    wrapper = mount(Register, {
      global: {
        plugins: [mockRouter],
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('组件渲染', () => {
    it('应该正确渲染注册表单', () => {
      expect(wrapper.find('.register-container').exists()).toBe(true);
      expect(wrapper.find('.register-card').exists()).toBe(true);
      expect(wrapper.find('h1.title').text()).toBe('用户注册');
      expect(wrapper.find('#phone').exists()).toBe(true);
      expect(wrapper.find('#email').exists()).toBe(true);
      expect(wrapper.find('#idCard').exists()).toBe(true);
      expect(wrapper.find('#address').exists()).toBe(true);
      expect(wrapper.find('#password').exists()).toBe(true);
      expect(wrapper.find('#confirmPassword').exists()).toBe(true);
      expect(wrapper.find('.register-btn').exists()).toBe(true);
    });

    it('应该显示登录链接', () => {
      const loginLink = wrapper.find('.form-footer a');
      expect(loginLink.exists()).toBe(true);
      expect(loginLink.text()).toBe('立即登录');
      expect(loginLink.attributes('href')).toBe('/login');
    });
  });

  describe('表单校验 - 手机号码', () => {
    it('应该显示无效手机号码的错误信息', async () => {
      const phoneInput = wrapper.find('#phone');
      await phoneInput.setValue('12345');
      await phoneInput.trigger('blur');

      expect(wrapper.find('.error-message').text()).toContain('请输入正确的手机号码');
    });

    it('有效手机号码不显示错误', async () => {
      const phoneInput = wrapper.find('#phone');
      await phoneInput.setValue('13800138000');
      await phoneInput.trigger('blur');

      expect(wrapper.find('.error-message').exists()).toBe(false);
    });
  });

  describe('表单校验 - 电子邮箱', () => {
    it('应该显示无效邮箱的错误信息', async () => {
      const emailInput = wrapper.find('#email');
      await emailInput.setValue('invalid-email');
      await emailInput.trigger('blur');

      expect(wrapper.find('.error-message').text()).toContain('请输入正确的电子邮箱');
    });

    it('有效邮箱不显示错误', async () => {
      const emailInput = wrapper.find('#email');
      await emailInput.setValue('test@example.com');
      await emailInput.trigger('blur');

      expect(wrapper.find('.error-message').exists()).toBe(false);
    });
  });

  describe('表单校验 - 身份证号', () => {
    it('应该显示无效身份证号的错误信息', async () => {
      const idCardInput = wrapper.find('#idCard');
      await idCardInput.setValue('invalid');
      await idCardInput.trigger('blur');

      expect(wrapper.find('.error-message').text()).toContain('请输入正确的身份证号');
    });

    it('有效身份证号不显示错误', async () => {
      const idCardInput = wrapper.find('#idCard');
      await idCardInput.setValue('110101199001011234');
      await idCardInput.trigger('blur');

      expect(wrapper.find('.error-message').exists()).toBe(false);
    });
  });

  describe('表单校验 - 地址', () => {
    it('应该显示空地址的错误信息', async () => {
      const addressInput = wrapper.find('#address');
      await addressInput.setValue('');
      await addressInput.trigger('blur');

      expect(wrapper.find('.error-message').text()).toContain('请输入地址');
    });

    it('有地址时不显示错误', async () => {
      const addressInput = wrapper.find('#address');
      await addressInput.setValue('北京市朝阳区');
      await addressInput.trigger('blur');

      expect(wrapper.find('.error-message').exists()).toBe(false);
    });
  });

  describe('表单校验 - 密码', () => {
    it('应该显示弱密码的错误信息', async () => {
      const passwordInput = wrapper.find('#password');
      await passwordInput.setValue('weak');
      await passwordInput.trigger('blur');

      expect(wrapper.find('.error-message').text()).toContain('密码至少8位，包含字母和数字');
    });

    it('有效密码不显示错误', async () => {
      const passwordInput = wrapper.find('#password');
      await passwordInput.setValue('Password123');
      await passwordInput.trigger('blur');

      expect(wrapper.find('.error-message').exists()).toBe(false);
    });
  });

  describe('表单校验 - 确认密码', () => {
    it('应该显示密码不一致的错误信息', async () => {
      await wrapper.find('#password').setValue('Password123');
      const confirmInput = wrapper.find('#confirmPassword');
      await confirmInput.setValue('Different123');
      await confirmInput.trigger('blur');

      expect(wrapper.find('.error-message').text()).toContain('两次输入的密码不一致');
    });

    it('密码一致时不显示错误', async () => {
      await wrapper.find('#password').setValue('Password123');
      const confirmInput = wrapper.find('#confirmPassword');
      await confirmInput.setValue('Password123');
      await confirmInput.trigger('blur');

      expect(wrapper.find('.error-message').exists()).toBe(false);
    });
  });

  describe('注册提交', () => {
    it('表单无效时不提交', async () => {
      await wrapper.find('#phone').setValue('invalid');
      await wrapper.find('#email').setValue('invalid-email');
      await wrapper.find('#idCard').setValue('invalid');
      await wrapper.find('#address').setValue('');
      await wrapper.find('#password').setValue('weak');
      await wrapper.find('#confirmPassword').setValue('different');
      
      await wrapper.find('form').trigger('submit.prevent');

      expect(mockAuthStore.register).not.toHaveBeenCalled();
    });

    it('表单有效时提交注册', async () => {
      mockAuthStore.register.mockResolvedValue({ message: '注册成功' });

      await wrapper.find('#phone').setValue('13800138000');
      await wrapper.find('#email').setValue('test@example.com');
      await wrapper.find('#idCard').setValue('110101199001011234');
      await wrapper.find('#address').setValue('北京市朝阳区');
      await wrapper.find('#password').setValue('Password123');
      await wrapper.find('#confirmPassword').setValue('Password123');
      
      await wrapper.find('form').trigger('submit.prevent');

      expect(mockAuthStore.register).toHaveBeenCalled();
      const callArgs = mockAuthStore.register.mock.calls[0][0];
      expect(callArgs.phone).toBe('13800138000');
      expect(callArgs.email).toBe('test@example.com');
      expect(callArgs.idCard).toBe('110101199001011234');
      expect(callArgs.address).toBe('北京市朝阳区');
      expect(callArgs.password).toContain('Password123');
    });

    it('注册成功后显示成功消息', async () => {
      mockAuthStore.register.mockResolvedValue({ message: '注册成功' });

      await wrapper.find('#phone').setValue('13800138000');
      await wrapper.find('#email').setValue('test@example.com');
      await wrapper.find('#idCard').setValue('110101199001011234');
      await wrapper.find('#address').setValue('北京市朝阳区');
      await wrapper.find('#password').setValue('Password123');
      await wrapper.find('#confirmPassword').setValue('Password123');
      
      await wrapper.find('form').trigger('submit.prevent');
      await wrapper.vm.$nextTick();

      expect(ElMessage.success).toHaveBeenCalledWith('注册成功，请登录');
    });

    it('注册失败后显示错误消息', async () => {
      const mockError = {
        response: {
          data: {
            message: '手机号已被注册',
          },
        },
      };
      mockAuthStore.register.mockRejectedValue(mockError);

      await wrapper.find('#phone').setValue('13800138000');
      await wrapper.find('#email').setValue('test@example.com');
      await wrapper.find('#idCard').setValue('110101199001011234');
      await wrapper.find('#address').setValue('北京市朝阳区');
      await wrapper.find('#password').setValue('Password123');
      await wrapper.find('#confirmPassword').setValue('Password123');
      
      await wrapper.find('form').trigger('submit.prevent');
      await wrapper.vm.$nextTick();

      expect(ElMessage.error).toHaveBeenCalledWith('手机号已被注册');
    });

    it('注册失败无响应数据时显示默认错误', async () => {
      mockAuthStore.register.mockRejectedValue(new Error());

      await wrapper.find('#phone').setValue('13800138000');
      await wrapper.find('#email').setValue('test@example.com');
      await wrapper.find('#idCard').setValue('110101199001011234');
      await wrapper.find('#address').setValue('北京市朝阳区');
      await wrapper.find('#password').setValue('Password123');
      await wrapper.find('#confirmPassword').setValue('Password123');
      
      await wrapper.find('form').trigger('submit.prevent');
      await wrapper.vm.$nextTick();

      expect(ElMessage.error).toHaveBeenCalledWith('注册失败，请稍后重试');
    });
  });

  describe('加载状态', () => {
    it('注册中按钮应该显示加载状态', async () => {
      mockAuthStore.getIsLoading = true;
      
      wrapper = mount(Register, {
        global: {
          plugins: [mockRouter],
        },
      });

      expect(wrapper.find('.register-btn').text()).toContain('注册中...');
      expect(wrapper.find('.register-btn').attributes('disabled')).toBeDefined();
    });
  });
});
