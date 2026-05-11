# 登录注册流程测试覆盖

> **Workspace:** d:\code\trae\gsb\20260509\B-2-代码测试-1\TestM_4

---

## User
登录注册流程缺少测试覆盖，改动后只能手动验证。添加测试用例覆盖表单校验、状态更新和请求拦截，全部用 TypeScript 编写，mock 接口层独立验证前端逻辑。

## Assistant
让我先探索一下项目结构，了解登录注册相关的代码和测试框架配置。

现在我已经了解了项目结构。让我创建一个完整的测试计划并开始实现。



现在配置Vitest测试环境，先更新package.json添加测试脚本，然后创建配置文件：



现在创建测试目录和测试文件，首先创建setup文件和表单校验测试：





现在运行测试验证所有测试用例：


有3个测试失败了，让我修复这些问题：





我发现auth store中getter和action同名了（getUserInfo）。让我修复这个问题：







现在重新运行测试验证修复：



现在只有1个测试失败了，让我修复这个超时错误的测试：






所有测试都已通过！以下是完成的工作总结：

## 测试覆盖完成情况

### 1. **安装的依赖**
- `vitest` - 测试框架
- `@vue/test-utils` - Vue组件测试工具
- `happy-dom` - DOM环境模拟
- `axios-mock-adapter` - Axios请求Mock

### 2. **创建的测试文件（共5个，83个测试用例）**

| 文件 | 测试内容 | 用例数 |
|------|----------|--------|
| `validation.test.ts` | 表单校验工具函数 | 20 |
| `auth.test.ts` | Pinia状态管理 | 15 |
| `api.test.ts` | API请求拦截与Mock接口 | 15 |
| `Login.spec.ts` | 登录组件 | 16 |
| `Register.spec.ts` | 注册组件 | 17 |

### 3. **测试覆盖范围**

**表单校验：
- ✅ 手机号码格式验证
- ✅ 电子邮箱格式验证  
- ✅ 身份证号格式验证
- ✅ 密码强度验证
- ✅ 确认密码一致性验证
- ✅ 整体表单数据验证

**状态管理（Pinia）：
- ✅ 初始状态与本地存储恢复
- ✅ 登录流程（成功/失败）
- ✅ 注册流程（成功/失败）
- ✅ 获取用户信息（成功/失败）
- ✅ 登出流程（成功/失败）
- ✅ 状态清除
- ✅ 所有Getters

**API请求拦截：
- ✅ 请求拦截器添加Token
- ✅ 响应拦截器数据处理
- ✅ 各种错误状态码处理（401/403/404/500）
- ✅ 网络错误处理
- ✅ Mock接口函数验证

**组件测试（登录/注册）：
- ✅ 组件渲染
- ✅ 表单字段校验
- ✅ 验证码发送与倒计时
- ✅ 表单提交流程
- ✅ 成功/失败消息提示
- ✅ 加载状态显示

### 4. **修复的代码问题
- 修复了 `auth.ts` 中 `getUserInfo` 命名冲突问题，将 action 重命名为 `fetchUserInfo`

### 5. **使用方式**
```bash
# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 启动UI界面运行测试
npm run test:ui
```

## User
把登录后进入首页时取用户信息的调用改对，再补一条对应的页面或 store 测试，确认用户登录后能正常看到个人信息

## Assistant
让我先查看首页和路由配置，了解登录后获取用户信息的流程：

我发现问题了！在Home.vue的第159行，调用的是`authStore.getUserInfo()`，这是getter而不是action。让我修复这个问题并添加测试用例：



现在创建Home组件的测试用例：





我发现测试文件中有语法错误，让我修复：






现在运行所有测试验证：




只有1个测试失败，让我修复路由跳转的测试方式：







同样修复获取用户信息失败的测试：






现在运行测试验证所有测试是否通过：






所有 **103个测试全部通过**！

## 完成的修改和测试

### 1. **修复的代码问题**

**文件：** `src/views/Home.vue:156-171`

1. **修复了方法调用错误**：
   - 将 `authStore.getUserInfo()` 改为 `authStore.fetchUserInfo()`
   - 原因：`getUserInfo` 是 getter，`fetchUserInfo` 才是 action

2. **优化了挂载逻辑**：
   - 先检查认证状态，未认证直接跳转
   - 避免未认证时不必要的 API 调用

### 2. **新增的测试文件**

**文件：** `src/tests/Home.spec.ts`（20个测试用例）

| 测试分组 | 覆盖内容 |
|---------|---------|
| **页面挂载时的认证检查** | - 未认证时跳转到登录页<br>- 已认证无用户信息时调用 `fetchUserInfo`<br>- 已有用户信息不重复调用<br>- 获取失败显示错误并跳转 |
| **用户信息显示** | - 昵称和手机号显示<br>- 账号活跃/未激活状态<br>- 头像首字母显示<br>- 电子邮箱显示<br>- 身份证号脱敏<br>- 地址和注册时间显示 |
| **登出功能** | - 登出成功跳转<br>- 登出失败显示错误<br>- 加载状态显示 |
| **页面内容渲染** | - 安全提示区域<br>- 最近活动列表<br>- 系统通知 |

### 3. **测试覆盖统计**

| 模块 | 测试文件 | 用例数 |
|------|---------|--------|
| 表单校验 | `validation.test.ts` | 20 |
| 状态管理 | `auth.test.ts` | 15 |
| API拦截 | `api.test.ts` | 15 |
| 登录组件 | `Login.spec.ts` | 16 |
| 注册组件 | `Register.spec.ts` | 17 |
| 首页组件 | `Home.spec.ts` | 20 |
| **总计** | | **103** ✅ |

### 4. **运行方式**

```bash
npm run test          # 监听模式运行测试
npm run test:run      # 单次运行所有测试
npm run test:ui       # 可视化UI运行测试
```

现在登录后进入首页能够正常获取并显示用户个人信息了！

## User
把首页取用户信息的写法和 store 对齐

## Assistant
让我先看看 store 中用户信息的定义，然后对齐首页的写法：



我明白了，应该直接用 store 的 state 而不是 getter，这样写法和 store 定义对齐。让我修改：






现在同步更新测试文件：








现在运行测试验证：








所有 **103 个测试全部通过！

## 修改完成

### 对齐的内容

**文件：** `src/views/Home.vue:128`

- **之前：** `authStore.getUserInfo`（通过 getter 访问）
- **现在：** `authStore.userInfo`（直接访问 state）

这样写法就和 store 中 state 定义完全对齐了。

### Store 定义：
```typescript
state: (): AuthState => ({
  userInfo: getStoredUserInfo(),  // state 名: userInfo
  ...
})
```

首页使用：
```typescript
const userInfo = computed(() => authStore.userInfo);  // 直接用 userInfo
```

同时同步更新了 `Home.spec.ts` 测试文件中的所有 mock 数据。

