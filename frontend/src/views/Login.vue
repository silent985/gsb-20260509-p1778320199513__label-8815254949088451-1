<template>
  <div class="login-container">
    <div class="card login-card no-hover-card">
      <h1 class="title">用户登录</h1>
      <form @submit.prevent="handleLogin">
      
      <!-- 验证码弹窗 -->
      <el-dialog
        v-model="codeDialogVisible"
        title="验证码"
        width="280px"
        center
      >
        <div class="code-dialog-content">
          <p class="code-label">您的验证码是：</p>
          <p class="code-value">{{ currentCode }}</p>
          <p class="code-tip">请在登录表单中输入此验证码</p>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="codeDialogVisible = false" size="small">
              知道了
            </el-button>
          </span>
        </template>
      </el-dialog>
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
          <label class="form-label" for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            class="form-input"
            placeholder="请输入密码"
            @blur="validateField('password')"
          />
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="verificationCode">验证码</label>
          <div class="verification-code-container">
            <input
              type="text"
              id="verificationCode"
              v-model="form.verificationCode"
              class="form-input verification-code-input"
              placeholder="请输入验证码"
              @blur="validateField('verificationCode')"
            />
            <button
              type="button"
              class="btn btn-secondary send-code-btn"
              @click="sendVerificationCode"
              :disabled="countdown > 0"
            >
              {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
            </button>
          </div>
          <div v-if="errors.verificationCode" class="error-message">{{ errors.verificationCode }}</div>
        </div>
        
        <div class="form-group">
          <button
            type="submit"
            class="btn btn-primary login-btn"
            :disabled="authStore.getIsLoading"
          >
            <span v-if="authStore.getIsLoading" class="loading"></span>
            {{ authStore.getIsLoading ? '登录中...' : '登录' }}
          </button>
        </div>
        
        <div class="form-footer">
          <p>还没有账号？<a href="/register" class="link">立即注册</a></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../store/auth';
import { validatePhone, validatePassword } from '../utils/validation';
import { generateVerificationCode } from '../utils/crypto';

const router = useRouter();
const authStore = useAuthStore();

// 表单数据
const form = reactive({
  phone: '',
  password: '',
  verificationCode: '',
});

// 错误信息
const errors = reactive({
  phone: '',
  password: '',
  verificationCode: '',
});

// 倒计时
const countdown = ref(0);

// 验证码弹窗相关
const codeDialogVisible = ref(false);
const currentCode = ref('');

// 验证单个字段
const validateField = (field: string) => {
  switch (field) {
    case 'phone':
      errors.phone = validatePhone(form.phone) ? '' : '请输入正确的手机号码';
      break;
    case 'password':
      errors.password = validatePassword(form.password) ? '' : '密码至少8位，包含字母和数字';
      break;
    case 'verificationCode':
      errors.verificationCode = form.verificationCode.length === 6 ? '' : '验证码为6位数字';
      break;
  }
};

// 验证表单
const validateForm = (): boolean => {
  let isValid = true;
  
  validateField('phone');
  validateField('password');
  validateField('verificationCode');
  
  if (errors.phone || errors.password || errors.verificationCode) {
    isValid = false;
  }
  
  return isValid;
};

// 发送验证码
const sendVerificationCode = async () => {
  if (!validatePhone(form.phone)) {
    errors.phone = '请输入正确的手机号码';
    return;
  }
  
  try {
    // 生成验证码
    const code = generateVerificationCode();
    currentCode.value = code;
    
    // 显示验证码弹窗
    codeDialogVisible.value = true;
    
    // 开始倒计时
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error) {
    ElMessage.error('验证码获取失败，请稍后重试');
  }
};

// 处理登录
const handleLogin = async () => {
  if (!validateForm()) {
    return;
  }
  
  try {
    await authStore.login(form);
    ElMessage.success('登录成功');
    router.push('/home');
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '登录失败，请检查账号信息');
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 480px;
}

.verification-code-container {
  display: flex;
  gap: 12px;
}

.verification-code-input {
  flex: 1;
}

.send-code-btn {
  white-space: nowrap;
  padding: 0 20px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

/* 验证码弹窗样式 */
.code-dialog-content {
  text-align: center;
  padding: 15px 0;
}

.code-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.code-value {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
  letter-spacing: 4px;
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
}

.code-tip {
  font-size: 12px;
  color: #999;
}
</style>