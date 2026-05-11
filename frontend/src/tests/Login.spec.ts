import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Login from '../views/Login.vue';
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

const mockRouter = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/login', component: Login },
    { path: '/home', component: { template: '<div>Home</div>' } },
  ],
});

describe('Login Component - 登录组件', () => {
  let wrapper: any;
  let mockAuthStore: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockAuthStore = {
      login: vi.fn(),
      getIsLoading: false,
    };
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    wrapper = mount(Login, {
      global: {
        plugins: [mockRouter],
        stubs: {
          'el-dialog': {
            template: '<div class="el-dialog-stub" v-if="modelValue"><slot></slot><slot name="footer"></slot></div>',
            props: ['modelValue'],
          },
          'el-button': {
            template: '<button class="el-button-stub"><slot></slot></button>',
          },
        },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    wrapper.unmount();
  });

  describe('组件渲染', () => {
    it('应该正确渲染登录表单', () => {
      expect(wrapper.find('.login-container').exists()).toBe(true);
      expect(wrapper.find('.login-card').exists()).toBe(true);
      expect(wrapper.find('h1.title').text()).toBe('用户登录');
      expect(wrapper.find('#phone').exists()).toBe(true);
      expect(wrapper.find('#password').exists()).toBe(true);
      expect(wrapper.find('#verificationCode').exists()).toBe(true);
      expect(wrapper.find('.login-btn').exists()).toBe(true);
    });

    it('应该显示注册链接', () => {
      const registerLink = wrapper.find('.form-footer a');
      expect(registerLink.exists()).toBe(true);
      expect(registerLink.text()).toBe('立即注册');
      expect(registerLink.attributes('href')).toBe('/register');
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

  describe('表单校验 - 验证码', () => {
    it('应该显示无效验证码的错误信息', async () => {
      const codeInput = wrapper.find('#verificationCode');
      await codeInput.setValue('123');
      await codeInput.trigger('blur');

      expect(wrapper.find('.error-message').text()).toContain('验证码为6位数字');
    });

    it('6位验证码不显示错误', async () => {
      const codeInput = wrapper.find('#verificationCode');
      await codeInput.setValue('123456');
      await codeInput.trigger('blur');

      expect(wrapper.find('.error-message').exists()).toBe(false);
    });
  });

  describe('发送验证码', () => {
    it('手机号无效时不能发送验证码', async () => {
      await wrapper.find('#phone').setValue('invalid');
      await wrapper.find('.send-code-btn').trigger('click');

      expect(wrapper.find('.error-message').text()).toContain('请输入正确的手机号码');
    });

    it('手机号有效时显示验证码弹窗', async () => {
      await wrapper.find('#phone').setValue('13800138000');
      await wrapper.find('.send-code-btn').trigger('click');

      expect(wrapper.vm.codeDialogVisible).toBe(true);
      expect(wrapper.vm.currentCode).toHaveLength(6);
    });

    it('应该启动倒计时', async () => {
      await wrapper.find('#phone').setValue('13800138000');
      await wrapper.find('.send-code-btn').trigger('click');

      expect(wrapper.vm.countdown).toBe(60);
      
      vi.advanceTimersByTime(1000);
      expect(wrapper.vm.countdown).toBe(59);
      
      vi.advanceTimersByTime(59000);
      expect(wrapper.vm.countdown).toBe(0);
    });
  });

  describe('登录提交', () => {
    it('表单无效时不提交', async () => {
      await wrapper.find('#phone').setValue('invalid');
      await wrapper.find('#password').setValue('weak');
      await wrapper.find('#verificationCode').setValue('123');
      
      await wrapper.find('form').trigger('submit.prevent');

      expect(mockAuthStore.login).not.toHaveBeenCalled();
    });

    it('表单有效时提交登录', async () => {
      mockAuthStore.login.mockResolvedValue({ success: true });

      await wrapper.find('#phone').setValue('13800138000');
      await wrapper.find('#password').setValue('Password123');
      await wrapper.find('#verificationCode').setValue('123456');
      
      await wrapper.find('form').trigger('submit.prevent');

      expect(mockAuthStore.login).toHaveBeenCalledWith({
        phone: '13800138000',
        password: 'Password123',
        verificationCode: '123456',
      });
    });

    it('登录成功后显示成功消息并跳转', async () => {
      mockAuthStore.login.mockResolvedValue({ success: true });

      await wrapper.find('#phone').setValue('13800138000');
      await wrapper.find('#password').setValue('Password123');
      await wrapper.find('#verificationCode').setValue('123456');
      
      await wrapper.find('form').trigger('submit.prevent');
      await wrapper.vm.$nextTick();

      expect(ElMessage.success).toHaveBeenCalledWith('登录成功');
    });

    it('登录失败后显示错误消息', async () => {
      const mockError = {
        response: {
          data: {
            message: '账号或密码错误',
          },
        },
      };
      mockAuthStore.login.mockRejectedValue(mockError);

      await wrapper.find('#phone').setValue('13800138000');
      await wrapper.find('#password').setValue('Password123');
      await wrapper.find('#verificationCode').setValue('123456');
      
      await wrapper.find('form').trigger('submit.prevent');
      await wrapper.vm.$nextTick();

      expect(ElMessage.error).toHaveBeenCalledWith('账号或密码错误');
    });

    it('登录失败无响应数据时显示默认错误', async () => {
      mockAuthStore.login.mockRejectedValue(new Error());

      await wrapper.find('#phone').setValue('13800138000');
      await wrapper.find('#password').setValue('Password123');
      await wrapper.find('#verificationCode').setValue('123456');
      
      await wrapper.find('form').trigger('submit.prevent');
      await wrapper.vm.$nextTick();

      expect(ElMessage.error).toHaveBeenCalledWith('登录失败，请检查账号信息');
    });
  });

  describe('加载状态', () => {
    it('登录中按钮应该显示加载状态', async () => {
      mockAuthStore.getIsLoading = true;
      
      wrapper = mount(Login, {
        global: {
          plugins: [mockRouter],
          stubs: {
            'el-dialog': {
              template: '<div class="el-dialog-stub" v-if="modelValue"><slot></slot><slot name="footer"></slot></div>',
              props: ['modelValue'],
            },
            'el-button': {
              template: '<button class="el-button-stub"><slot></slot></button>',
            },
          },
        },
      });

      expect(wrapper.find('.login-btn').text()).toContain('登录中...');
      expect(wrapper.find('.login-btn').attributes('disabled')).toBeDefined();
    });
  });
});
