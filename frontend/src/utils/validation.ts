// 数据验证工具函数

/**
 * 验证手机号码格式
 * @param phone 手机号码
 * @returns 是否验证通过
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证电子邮箱格式
 * @param email 电子邮箱
 * @returns 是否验证通过
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证身份证号格式
 * @param idCard 身份证号
 * @returns 是否验证通过
 */
export const validateIdCard = (idCard: string): boolean => {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return idCardRegex.test(idCard);
};

/**
 * 验证密码强度
 * @param password 密码
 * @returns 是否验证通过
 */
export const validatePassword = (password: string): boolean => {
  // 至少8位，包含字母和数字
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * 验证表单数据
 * @param formData 表单数据
 * @returns 验证结果
 */
export const validateForm = (formData: any): { isValid: boolean; errors: any } => {
  const errors: any = {};
  
  // 验证手机号码
  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = '请输入正确的手机号码';
  }
  
  // 验证电子邮箱
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = '请输入正确的电子邮箱';
  }
  
  // 验证身份证号
  if (formData.idCard && !validateIdCard(formData.idCard)) {
    errors.idCard = '请输入正确的身份证号';
  }
  
  // 验证密码
  if (formData.password && !validatePassword(formData.password)) {
    errors.password = '密码至少8位，包含字母和数字';
  }
  
  // 验证确认密码
  if (formData.confirmPassword && formData.confirmPassword !== formData.password) {
    errors.confirmPassword = '两次输入的密码不一致';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};