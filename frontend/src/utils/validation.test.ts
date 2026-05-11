import { describe, it, expect } from 'vitest';
import {
  validatePhone,
  validateEmail,
  validateIdCard,
  validatePassword,
  validateForm
} from './validation';

describe('表单校验工具函数', () => {
  describe('validatePhone - 手机号码验证', () => {
    it('应该通过有效的手机号码', () => {
      expect(validatePhone('13800138000')).toBe(true);
      expect(validatePhone('15912345678')).toBe(true);
      expect(validatePhone('18699998888')).toBe(true);
      expect(validatePhone('13900001111')).toBe(true);
    });

    it('应该拒绝无效的手机号码', () => {
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('12345678901')).toBe(false);
      expect(validatePhone('1380013800')).toBe(false);
      expect(validatePhone('138001380000')).toBe(false);
      expect(validatePhone('03800138000')).toBe(false);
      expect(validatePhone('abc12345678')).toBe(false);
      expect(validatePhone(' 13800138000 ')).toBe(false);
    });
  });

  describe('validateEmail - 电子邮箱验证', () => {
    it('应该通过有效的电子邮箱', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.org')).toBe(true);
      expect(validateEmail('user123@mail.cn')).toBe(true);
      expect(validateEmail('a@b.co')).toBe(true);
    });

    it('应该拒绝无效的电子邮箱', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
    });
  });

  describe('validateIdCard - 身份证号验证', () => {
    it('应该通过有效的身份证号', () => {
      expect(validateIdCard('110101199003074518')).toBe(true);
      expect(validateIdCard('310102198812121234')).toBe(true);
      expect(validateIdCard('440301199505055678')).toBe(true);
      expect(validateIdCard('11010119900307451X')).toBe(true);
      expect(validateIdCard('11010119900307451x')).toBe(true);
      expect(validateIdCard('110101900307451')).toBe(true);
    });

    it('应该拒绝无效的身份证号', () => {
      expect(validateIdCard('')).toBe(false);
      expect(validateIdCard('123456')).toBe(false);
      expect(validateIdCard('1101011990030745')).toBe(false);
      expect(validateIdCard('1101011990030745123')).toBe(false);
      expect(validateIdCard('abcdefghijklmnopqr')).toBe(false);
      expect(validateIdCard(' 110101199003074518 ')).toBe(false);
    });
  });

  describe('validatePassword - 密码强度验证', () => {
    it('应该通过有效的密码', () => {
      expect(validatePassword('Abc12345')).toBe(true);
      expect(validatePassword('password1')).toBe(true);
      expect(validatePassword('a1b2c3d4')).toBe(true);
      expect(validatePassword('Test1234')).toBe(true);
      expect(validatePassword('ABCDEFG1')).toBe(true);
    });

    it('应该拒绝无效的密码', () => {
      expect(validatePassword('')).toBe(false);
      expect(validatePassword('abc123')).toBe(false);
      expect(validatePassword('password')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('abcdefgh')).toBe(false);
      expect(validatePassword('Ab1')).toBe(false);
    });
  });

  describe('validateForm - 表单整体验证', () => {
    it('应该通过所有字段都有效的表单', () => {
      const formData = {
        phone: '13800138000',
        email: 'test@example.com',
        idCard: '110101199003074518',
        password: 'Abc12345',
        confirmPassword: 'Abc12345'
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('应该检测到无效的手机号码', () => {
      const formData = {
        phone: 'invalid',
        email: 'test@example.com',
        password: 'Abc12345',
        confirmPassword: 'Abc12345'
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.phone).toBe('请输入正确的手机号码');
    });

    it('应该检测到无效的电子邮箱', () => {
      const formData = {
        phone: '13800138000',
        email: 'invalid',
        password: 'Abc12345',
        confirmPassword: 'Abc12345'
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('请输入正确的电子邮箱');
    });

    it('应该检测到无效的身份证号', () => {
      const formData = {
        phone: '13800138000',
        email: 'test@example.com',
        idCard: 'invalid',
        password: 'Abc12345',
        confirmPassword: 'Abc12345'
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.idCard).toBe('请输入正确的身份证号');
    });

    it('应该检测到无效的密码', () => {
      const formData = {
        phone: '13800138000',
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak'
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('密码至少8位，包含字母和数字');
    });

    it('应该检测到两次密码不一致', () => {
      const formData = {
        phone: '13800138000',
        email: 'test@example.com',
        password: 'Abc12345',
        confirmPassword: 'Abc12346'
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBe('两次输入的密码不一致');
    });

    it('应该检测到多个字段的错误', () => {
      const formData = {
        phone: 'invalid',
        email: 'invalid',
        password: 'weak',
        confirmPassword: 'weak1'
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.phone).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.confirmPassword).toBeDefined();
    });

    it('应该允许跳过可选字段的验证', () => {
      const formData = {
        phone: '13800138000',
        password: 'Abc12345'
      };
      const result = validateForm(formData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });
  });
});
