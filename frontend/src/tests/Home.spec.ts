import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Home from '../views/Home.vue';
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
    { path: '/home', component: Home },
    { path: '/login', component: { template: '<div>Login</div>' } },
  ],
});

const mockUser = {
  id: '1',
  phone: '13800138000',
  email: 'test@example.com',
  nickname: '测试用户',
  avatar: 'https://example.com/avatar.png',
  status: 'active',
  idCard: '110101199001011234',
  address: '北京市朝阳区',
  createdAt: '2024-01-01',
};

describe('Home Component - 首页组件', () => {
  let wrapper: any;
  let mockAuthStore: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockAuthStore = {
      userInfo: null,
      getIsAuthenticated: true,
      getIsLoading: false,
      fetchUserInfo: vi.fn(),
      logout: vi.fn(),
    };
    (useAuthStore as any).mockReturnValue(mockAuthStore);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('页面挂载时的认证检查', () => {
    it('未认证时应该跳转到登录页', async () => {
      mockAuthStore.getIsAuthenticated = false;
      const pushSpy = vi.spyOn(mockRouter, 'push');

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(pushSpy).toHaveBeenCalledWith('/login');
      expect(mockAuthStore.fetchUserInfo).not.toHaveBeenCalled();
      pushSpy.mockRestore();
    });

    it('已认证但无用户信息时应该调用fetchUserInfo', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = null;
      mockAuthStore.fetchUserInfo.mockResolvedValue(mockUser);

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(mockAuthStore.fetchUserInfo).toHaveBeenCalled();
    });

    it('已认证且有用户信息时不重复调用fetchUserInfo', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      expect(mockAuthStore.fetchUserInfo).not.toHaveBeenCalled();
    });

    it('获取用户信息失败时显示错误并跳转登录', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = null;
      mockAuthStore.fetchUserInfo.mockRejectedValue(new Error('获取失败'));
      const pushSpy = vi.spyOn(mockRouter, 'push');

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(ElMessage.error).toHaveBeenCalledWith('获取用户信息失败');
      expect(pushSpy).toHaveBeenCalledWith('/login');
      pushSpy.mockRestore();
    });
  });

  describe('用户信息显示', () => {
    it('应该正确显示用户昵称和手机号', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('.user-details h3').text()).toBe('测试用户');
      expect(wrapper.find('.user-details p').text()).toBe('13800138000');
    });

    it('应该显示账号活跃状态', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      const statusTag = wrapper.find('.status-tag');
      expect(statusTag.exists()).toBe(true);
      expect(statusTag.text()).toBe('账号活跃');
      expect(statusTag.classes()).toContain('status-active');
    });

    it('应该显示账号未激活状态', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = { ...mockUser, status: 'inactive' };

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      const statusTag = wrapper.find('.status-tag');
      expect(statusTag.text()).toBe('账号未激活');
      expect(statusTag.classes()).toContain('status-inactive');
    });

    it('应该显示用户头像首字母', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('.avatar').text()).toBe('测');
    });

    it('无昵称时头像显示默认U', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = { ...mockUser, nickname: '' };

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('.avatar').text()).toBe('U');
    });

    it('应该显示电子邮箱', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      const profileItems = wrapper.findAll('.profile-item');
      expect(profileItems[0].find('.profile-value').text()).toBe('test@example.com');
    });

    it('应该显示脱敏后的身份证号', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      const profileItems = wrapper.findAll('.profile-item');
      expect(profileItems[1].find('.profile-value').text()).toBe('110101********1234');
    });

    it('无身份证号时显示未设置', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = { ...mockUser, idCard: '' };

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      const profileItems = wrapper.findAll('.profile-item');
      expect(profileItems[1].find('.profile-value').text()).toBe('未设置');
    });

    it('应该显示地址', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      const profileItems = wrapper.findAll('.profile-item');
      expect(profileItems[2].find('.profile-value').text()).toBe('北京市朝阳区');
    });

    it('应该显示注册时间', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      const profileItems = wrapper.findAll('.profile-item');
      expect(profileItems[3].find('.profile-value').text()).toBe('2024-01-01');
    });
  });

  describe('登出功能', () => {
    it('登出成功后跳转登录页', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;
      mockAuthStore.logout.mockResolvedValue({ success: true });

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      await wrapper.find('.logout-btn').trigger('click');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(ElMessage.success).toHaveBeenCalledWith('登出成功');
    });

    it('登出失败显示错误', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;
      mockAuthStore.logout.mockRejectedValue(new Error('登出失败'));

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      await wrapper.find('.logout-btn').trigger('click');
      await wrapper.vm.$nextTick();

      expect(ElMessage.error).toHaveBeenCalledWith('登出失败，请稍后重试');
    });

    it('登出中按钮显示加载状态', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;
      mockAuthStore.getIsLoading = true;

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('.logout-btn').text()).toContain('登出中...');
      expect(wrapper.find('.logout-btn').attributes('disabled')).toBeDefined();
    });
  });

  describe('页面内容渲染', () => {
    it('应该渲染安全提示区域', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('.security-tips').exists()).toBe(true);
      expect(wrapper.find('.security-tips h3').text()).toBe('安全提示');
      expect(wrapper.findAll('.security-tips li').length).toBe(3);
    });

    it('应该渲染最近活动列表', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('.activity-list').exists()).toBe(true);
      expect(wrapper.findAll('.activity-item').length).toBe(3);
    });

    it('应该渲染系统通知', async () => {
      mockAuthStore.getIsAuthenticated = true;
      mockAuthStore.userInfo = mockUser;

      wrapper = mount(Home, {
        global: {
          plugins: [mockRouter],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('.notifications').exists()).toBe(true);
      expect(wrapper.findAll('.notification-item').length).toBe(2);
    });
  });
});
