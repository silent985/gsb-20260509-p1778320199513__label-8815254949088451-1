// 加密工具函数

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 简单的密码加密（实际项目中应使用更安全的加密方式）
 * @param password 原始密码
 * @returns 加密后的密码
 */
export const encryptPassword = (password: string): string => {
  // 这里使用简单的Base64编码模拟加密，实际项目中应使用bcrypt等安全算法
  return btoa(password + generateRandomString(10));
};

/**
 * 生成验证码
 * @param length 验证码长度
 * @returns 验证码
 */
export const generateVerificationCode = (length: number = 6): string => {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 存储用户令牌
 * @param token 令牌
 */
export const storeToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * 获取用户令牌
 * @returns 令牌
 */
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * 移除用户令牌
 */
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * 存储用户信息
 * @param userInfo 用户信息
 */
export const storeUserInfo = (userInfo: any): void => {
  localStorage.setItem('user_info', JSON.stringify(userInfo));
};

/**
 * 获取用户信息
 * @returns 用户信息
 */
export const getUserInfo = (): any => {
  const userInfo = localStorage.getItem('user_info');
  return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * 移除用户信息
 */
export const removeUserInfo = (): void => {
  localStorage.removeItem('user_info');
};