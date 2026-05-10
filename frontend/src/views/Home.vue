<template>
  <div class="home-container">
    <div class="card home-card">
      <div class="home-header">
        <div class="user-info">
          <div class="avatar">
            {{ userInitial }}
          </div>
          <div class="user-details">
            <h3>{{ userInfo?.nickname || '用户' }}</h3>
            <p>{{ userInfo?.phone || '' }}</p>
            <span class="status-tag" :class="userInfo?.status === 'active' ? 'status-active' : 'status-inactive'">
              {{ userInfo?.status === 'active' ? '账号活跃' : '账号未激活' }}
            </span>
          </div>
        </div>
        <button
          type="button"
          class="btn btn-secondary logout-btn"
          @click="handleLogout"
          :disabled="authStore.getIsLoading"
        >
          <span v-if="authStore.getIsLoading" class="loading"></span>
          {{ authStore.getIsLoading ? '登出中...' : '登出' }}
        </button>
      </div>
      
      <div class="user-profile">
        <h2 class="profile-title">个人信息</h2>
        <div class="profile-grid">
          <div class="profile-item">
            <span class="profile-label">电子邮箱</span>
            <span class="profile-value">{{ userInfo?.email || '未设置' }}</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">身份证号</span>
            <span class="profile-value">{{ maskIdCard(userInfo?.idCard || '') }}</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">地址</span>
            <span class="profile-value">{{ userInfo?.address || '未设置' }}</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">注册时间</span>
            <span class="profile-value">{{ userInfo?.createdAt || '未设置' }}</span>
          </div>
        </div>
      </div>
      
      <div class="security-tips">
        <h3>安全提示</h3>
        <ul>
          <li>请定期修改密码，保持账号安全</li>
          <li>不要将账号密码透露给他人</li>
          <li>如有异常登录，请及时联系客服</li>
        </ul>
      </div>

      <h2 class="profile-title">最近活动</h2>
      <div class="activity-list">
        <div class="activity-item">
          <div class="activity-icon">
            <span class="icon login-icon">🔑</span>
          </div>
          <div class="activity-content">
            <div class="activity-title">账号登录</div>
            <div class="activity-time">2024-01-20 10:30</div>
          </div>
          <div class="activity-status status-success">成功</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">
            <span class="icon notification-icon">📱</span>
          </div>
          <div class="activity-content">
            <div class="activity-title">验证码发送</div>
            <div class="activity-time">2024-01-20 10:28</div>
          </div>
          <div class="activity-status status-success">成功</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">
            <span class="icon login-icon">🔑</span>
          </div>
          <div class="activity-content">
            <div class="activity-title">账号登录</div>
            <div class="activity-time">2024-01-19 15:45</div>
          </div>
          <div class="activity-status status-success">成功</div>
        </div>
      </div>



      <h2 class="profile-title">系统通知</h2>
      <div class="notifications">
        <div class="notification-item">
          <div class="notification-content">
            <div class="notification-title">系统维护通知</div>
            <div class="notification-desc">系统将于2024-01-21 22:00-24:00进行维护升级</div>
            <div class="notification-time">2024-01-20 09:00</div>
          </div>
        </div>
        <div class="notification-item">
          <div class="notification-content">
            <div class="notification-title">安全提醒</div>
            <div class="notification-desc">您的账号已30天未修改密码，请及时更新</div>
            <div class="notification-time">2024-01-18 14:30</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { useRouter } from 'vue-router';

import { ElMessage } from 'element-plus';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

// 获取用户信息
const userInfo = computed(() => authStore.getUserInfo);

// 计算用户头像初始化
const userInitial = computed(() => {
  if (userInfo.value?.nickname) {
    return userInfo.value.nickname.charAt(0).toUpperCase();
  }
  return 'U';
});

// 身份证号脱敏
const maskIdCard = (idCard: string): string => {
  if (!idCard) return '未设置';
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
};

// 处理登出
const handleLogout = async () => {
  try {
    await authStore.logout();
    ElMessage.success('登出成功');
    router.push('/login');
  } catch (error) {
    ElMessage.error('登出失败，请稍后重试');
  }
};

// 页面挂载时获取用户信息
onMounted(async () => {
  if (!userInfo.value) {
    try {
      await authStore.getUserInfo();
    } catch (error) {
      ElMessage.error('获取用户信息失败');
      router.push('/login');
    }
  }
  
  // 如果未认证，跳转到登录页
  if (!authStore.getIsAuthenticated) {
    router.push('/login');
  }
});
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.home-card {
  width: 100%;
  max-width: 1000px;
  padding: 40px;
}

.profile-title {
  font-size: 20px;
  font-weight: 600;
  margin: 32px 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.profile-item {
  background: rgba(102, 126, 234, 0.05);
  padding: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.profile-item:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.profile-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.profile-value {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.security-tips {
  margin-top: 32px;
  padding: 20px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.security-tips h3 {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.security-tips ul {
  list-style: disc;
  padding-left: 20px;
  font-size: 14px;
  color: #666;
}

.security-tips li {
  margin-bottom: 8px;
}

/* 最近活动样式 */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(4px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  margin-right: 16px;
  flex-shrink: 0;
}

.activity-icon .icon {
  font-size: 18px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

.activity-status {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
}

.status-success {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}



/* 系统通知样式 */
.notifications {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  padding: 20px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(4px);
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.notification-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

@media (max-width: 768px) {
  .home-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .logout-btn {
    width: 100%;
  }
  
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .activity-icon {
    align-self: center;
  }
  

}
</style>