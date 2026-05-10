<template>
  <div class="register-container">
    <div class="card register-card no-hover-card">
      <h1 class="title">用户注册</h1>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label" for="phone">手机号码</label>
          <input
            type="tel"
            id="phone"
            v-model="form.phone"
            class="form-input"
            placeholder="请输入手机号码"
            @blur="validateField('phone')"
          />
          <div v-if="errors.phone" class="error-message">{{ errors.phone }}</div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="email">电子邮箱</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            class="form-input"
            placeholder="请输入电子邮箱"
            @blur="validateField('email')"
          />
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="idCard">身份证号</label>
          <input
            type="text"
            id="idCard"
            v-model="form.idCard"
            class="form-input"
            placeholder="请输入身份证号"
            @blur="validateField('idCard')"
          />
          <div v-if="errors.idCard" class="error-message">{{ errors.idCard }}</div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="address">地址</label>
          <input
            type="text"
            id="address"
            v-model="form.address"
            class="form-input"
            placeholder="请输入地址"
            @blur="validateField('address')"
          />
          <div v-if="errors.address" class="error-message">{{ errors.address }}</div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            class="form-input"
            placeholder="请输入密码（至少8位，包含字母和数字）"
            @blur="validateField('password')"
          />
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            class="form-input"
            placeholder="请再次输入密码"
            @blur="validateField('confirmPassword')"
          />
          <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
        </div>
        
        <div class="form-group">
          <button
            type="submit"
            class="btn btn-primary register-btn"
            :disabled="authStore.getIsLoading"
          >
            <span v-if="authStore.getIsLoading" class="loading"></span>
            {{ authStore.getIsLoading ? '注册中...' : '注册' }}
          </button>
        </div>
        
        <div class="form-footer">
          <p>已有账号？<a href="/login" class="link">立即登录</a></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../store/auth';
import { validatePhone, validateEmail, validateIdCard, validatePassword } from '../utils/validation';
import { encryptPassword } from '../utils/crypto';

const router = useRouter();
const authStore = useAuthStore();

// 表单数据
const form = reactive({
  phone: '',
  email: '',
  idCard: '',
  address: '',
  password: '',
  confirmPassword: '',
});

// 错误信息
const errors = reactive({
  phone: '',
  email: '',
  idCard: '',
  address: '',
  password: '',
  confirmPassword: '',
});

// 验证单个字段
const validateField = (field: string) => {
  switch (field) {
    case 'phone':
      errors.phone = validatePhone(form.phone) ? '' : '请输入正确的手机号码';
      break;
    case 'email':
      errors.email = validateEmail(form.email) ? '' : '请输入正确的电子邮箱';
      break;
    case 'idCard':
      errors.idCard = validateIdCard(form.idCard) ? '' : '请输入正确的身份证号';
      break;
    case 'address':
      errors.address = form.address ? '' : '请输入地址';
      break;
    case 'password':
      errors.password = validatePassword(form.password) ? '' : '密码至少8位，包含字母和数字';
      break;
    case 'confirmPassword':
      errors.confirmPassword = form.confirmPassword === form.password ? '' : '两次输入的密码不一致';
      break;
  }
};

// 验证表单
const validateForm = (): boolean => {
  let isValid = true;
  
  validateField('phone');
  validateField('email');
  validateField('idCard');
  validateField('address');
  validateField('password');
  validateField('confirmPassword');
  
  if (errors.phone || errors.email || errors.idCard || errors.address || errors.password || errors.confirmPassword) {
    isValid = false;
  }
  
  return isValid;
};

// 处理注册
const handleRegister = async () => {
  if (!validateForm()) {
    return;
  }
  
  try {
    // 加密密码
    const encryptedPassword = encryptPassword(form.password);
    
    await authStore.register({
      phone: form.phone,
      email: form.email,
      idCard: form.idCard,
      address: form.address,
      password: encryptedPassword,
    });
    
    ElMessage.success('注册成功，请登录');
    router.push('/login');
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '注册失败，请稍后重试');
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 560px;
}

.register-btn {
  width: 100%;
  margin-top: 8px;
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style>