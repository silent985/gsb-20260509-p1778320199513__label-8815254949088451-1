import { describe, it, expect } from 'vitest';
import {
  validatePhone,
  validateEmail,
  validateIdCard,
  validatePassword,
  validateForm,
} from '../utils/validation';

describe('表单校验工具函数', () => {
  describe('validatePhone - 手机号码校验', () => {
    it('应该通过有效的手机号码', () => {
      expect(validatePhone('13800138000')).toBe(true);
      expect(validatePhone('15912345678')).toBe(true);
      expect(validatePhone('18699999999')).toBe(true);
      expect(validatePhone('13911112222')).toBe(true);
    });

    it('应该拒绝无效的手机号码', () => {
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('12345678901')).toBe(false);
      expect(validatePhone('1380013800')).toBe(false);
      expect(validatePhone('138001380000')).toBe(false);
      expect(validatePhone('abcdefghijk')).toBe(false);
      expect(validatePhone('03800138000')).toBe(false);
      expect(validatePhone('23800138000')).toBe(false);
    });
  });

  describe('validateEmail - 电子邮箱校验', () => {
    it('应该通过有效的电子邮箱', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.org')).toBe(true);
      expect(validateEmail('admin@company.cn')).toBe(true);
      expect(validateEmail('a123@test.co.jp')).toBe(true);
    });

    it('应该拒绝无效的电子邮箱', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('test')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('test example@domain.com')).toBe(false);
    });
  });

  describe('validateIdCard - 身份证号校验', () => {
    it('应该通过有效的身份证号', () => {
      expect(validateIdCard('110101199001011234')).toBe(true);
      expect(validateIdCard('11010119900101123X')).toBe(true);
      expect(validateIdCard('11010119900101123x')).toBe(true);
      expect(validateIdCard('123456789012345')).toBe(true);
    });

    it('应该拒绝无效的身份证号', () => {
      expect(validateIdCard('')).toBe(false);
      expect(validateIdCard('12345678901234')).toBe(false);
      expect(validateIdCard('12345678901234567')).toBe(false);
      expect(validateIdCard('1234567890123456789')).toBe(false);
      expect(validateIdCard('abcdefghijklmno')).toBe(false);
      expect(validateIdCard('11010119900101123Y')).toBe(false);
    });
  });

  describe('validatePassword - 密码强度校验', () => {
    it('应该通过有效的密码', () => {
      expect(validatePassword('Password123')).toBe(true);
      expect(validatePassword('abc12345')).toBe(true);
      expect(validatePassword('ABCDEFG1')).toBe(true);
      expect(validatePassword('a1b2c3d4')).toBe(true);
    });

    it('应该拒绝无效的密码', () => {
      expect(validatePassword('')).toBe(false);
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('allletters')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('Ab1')).toBe(false);
      expect(validatePassword('!@#$%^&*')).toBe(false);
    });
  });

  describe('validateForm - 表单数据校验', () => {
    it('应该通过有效的登录表单数据', () => {
      const formData = {
        phone: '13800138000',
        password: 'Password123',
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('应该通过有效的注册表单数据', () => {
      const formData = {
        phone: '13800138000',
        email: 'test@example.com',
        idCard: '110101199001011234',
        password: 'Password123',
        confirmPassword: 'Password123',
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('应该检测无效的手机号码', () => {
      const formData = {
        phone: 'invalid',
        password: 'Password123',
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.phone).toBe('请输入正确的手机号码');
    });

    it('应该检测无效的电子邮箱', () => {
      const formData = {
        phone: '13800138000',
        email: 'invalid-email',
        password: 'Password123',
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('请输入正确的电子邮箱');
    });

    it('应该检测无效的身份证号', () => {
      const formData = {
        phone: '13800138000',
        email: 'test@example.com',
        idCard: 'invalid',
        password: 'Password123',
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.idCard).toBe('请输入正确的身份证号');
    });

    it('应该检测无效的密码', () => {
      const formData = {
        phone: '13800138000',
        password: 'weak',
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('密码至少8位，包含字母和数字');
    });

    it('应该检测不一致的确认密码', () => {
      const formData = {
        phone: '13800138000',
        password: 'Password123',
        confirmPassword: 'Different123',
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBe('两次输入的密码不一致');
    });

    it('应该检测多个字段的错误', () => {
      const formData = {
        phone: 'invalid',
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different',
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.phone).toBeTruthy();
      expect(result.errors.email).toBeTruthy();
      expect(result.errors.password).toBeTruthy();
      expect(result.errors.confirmPassword).toBeTruthy();
    });
  });
});
