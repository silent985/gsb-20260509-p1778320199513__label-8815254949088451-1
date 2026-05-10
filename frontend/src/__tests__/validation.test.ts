import { describe, it, expect } from 'vitest';
import {
  validatePhone,
  validateEmail,
  validateIdCard,
  validatePassword,
  validateForm,
} from '../../src/utils/validation';

describe('validatePhone', () => {
  it('should return true for valid phone numbers', () => {
    expect(validatePhone('13800138000')).toBe(true);
    expect(validatePhone('15912345678')).toBe(true);
    expect(validatePhone('19999999999')).toBe(true);
  });

  it('should return false for phone numbers not starting with 1', () => {
    expect(validatePhone('23800138000')).toBe(false);
    expect(validatePhone('01380013800')).toBe(false);
  });

  it('should return false for phone numbers with wrong second digit', () => {
    expect(validatePhone('12000138000')).toBe(false);
    expect(validatePhone('10000138000')).toBe(false);
  });

  it('should return false for phone numbers that are too short', () => {
    expect(validatePhone('1380013800')).toBe(false);
    expect(validatePhone('138001380')).toBe(false);
  });

  it('should return false for phone numbers that are too long', () => {
    expect(validatePhone('138001380000')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validatePhone('')).toBe(false);
  });

  it('should return false for non-numeric input', () => {
    expect(validatePhone('1380013800a')).toBe(false);
    expect(validatePhone('abcdefghijk')).toBe(false);
  });
});

describe('validateEmail', () => {
  it('should return true for valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.name@domain.org')).toBe(true);
    expect(validateEmail('a+b@c.co')).toBe(true);
  });

  it('should return false for emails without @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('should return false for emails without domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('should return false for emails without TLD', () => {
    expect(validateEmail('user@example')).toBe(false);
  });

  it('should return false for emails with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false);
    expect(validateEmail('user@ example.com')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('should return false for emails with multiple @', () => {
    expect(validateEmail('user@@example.com')).toBe(false);
  });
});

describe('validateIdCard', () => {
  it('should return true for valid 18-digit ID cards', () => {
    expect(validateIdCard('110101199001011234')).toBe(true);
    expect(validateIdCard('11010119900101123X')).toBe(true);
    expect(validateIdCard('11010119900101123x')).toBe(true);
  });

  it('should return true for valid 15-digit ID cards', () => {
    expect(validateIdCard('110101900101123')).toBe(true);
  });

  it('should return false for wrong length', () => {
    expect(validateIdCard('11010119900101123')).toBe(false);
    expect(validateIdCard('1101011990010112345')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validateIdCard('')).toBe(false);
  });

  it('should return false for non-numeric 18-digit input (non-X ending)', () => {
    expect(validateIdCard('11010119900101123A')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should return true for valid passwords with letters and numbers', () => {
    expect(validatePassword('abc12345')).toBe(true);
    expect(validatePassword('Password1')).toBe(true);
    expect(validatePassword('a1b2c3d4e5f6')).toBe(true);
  });

  it('should return false for passwords shorter than 8 characters', () => {
    expect(validatePassword('Ab12345')).toBe(false);
    expect(validatePassword('a1b2c3')).toBe(false);
  });

  it('should return false for passwords without letters', () => {
    expect(validatePassword('12345678')).toBe(false);
  });

  it('should return false for passwords without numbers', () => {
    expect(validatePassword('abcdefgh')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validatePassword('')).toBe(false);
  });

  it('should return false for passwords with special characters', () => {
    expect(validatePassword('abc@1234')).toBe(false);
    expect(validatePassword('Pass!123')).toBe(false);
  });
});

describe('validateForm', () => {
  it('should return valid for correct login form data', () => {
    const result = validateForm({
      phone: '13800138000',
      password: 'Password1',
    });
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should return errors for invalid phone', () => {
    const result = validateForm({
      phone: '123',
      password: 'Password1',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.phone).toBe('请输入正确的手机号码');
  });

  it('should return errors for invalid email', () => {
    const result = validateForm({
      phone: '13800138000',
      email: 'invalid-email',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('请输入正确的电子邮箱');
  });

  it('should return errors for invalid idCard', () => {
    const result = validateForm({
      phone: '13800138000',
      idCard: '123',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.idCard).toBe('请输入正确的身份证号');
  });

  it('should return errors for invalid password', () => {
    const result = validateForm({
      phone: '13800138000',
      password: '123',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.password).toBe('密码至少8位，包含字母和数字');
  });

  it('should return errors when passwords do not match', () => {
    const result = validateForm({
      phone: '13800138000',
      password: 'Password1',
      confirmPassword: 'Password2',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.confirmPassword).toBe('两次输入的密码不一致');
  });

  it('should not validate fields that are not provided', () => {
    const result = validateForm({
      phone: '13800138000',
    });
    expect(result.isValid).toBe(true);
    expect(result.errors.phone).toBeUndefined();
  });

  it('should return multiple errors for multiple invalid fields', () => {
    const result = validateForm({
      phone: '123',
      email: 'bad',
      idCard: '456',
      password: 'short',
      confirmPassword: 'different',
    });
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(3);
  });
});
