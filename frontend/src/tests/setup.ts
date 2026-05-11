import { config } from '@vue/test-utils';
import { vi } from 'vitest';

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
  ElDialog: {
    name: 'ElDialog',
    template: '<div><slot></slot><slot name="footer"></slot></div>',
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot></slot></button>',
  },
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

config.global.stubs = {
  'el-dialog': {
    template: '<div class="el-dialog-stub"><slot></slot><slot name="footer"></slot></div>',
  },
  'el-button': {
    template: '<button class="el-button-stub"><slot></slot></button>',
  },
};
