# 添加登录注册测试用例

> **Workspace:** d:\code\trae\gsb\20260509\B-2-代码测试-1\TestM_3

---

## User
登录注册流程缺少测试覆盖，改动后只能手动验证。添加测试用例覆盖表单校验、状态更新和请求拦截，全部用 TypeScript 编写，mock 接口层独立验证前端逻辑。

## Assistant
我来帮你添加登录注册流程的测试用例。首先让我了解一下项目结构，找到登录注册相关的代码。

现在我已经了解了项目结构，让我创建一个任务计划来添加测试用例。


现在开始安装 Vitest 测试框架和相关依赖：


依赖安装成功！现在让我配置 Vitest 并创建测试文件。



现在更新 package.json 添加测试脚本：




现在创建 Vitest 配置文件：





现在创建测试文件。首先创建表单校验工具的测试用例：




现在创建表单校验工具函数的测试用例：






现在创建 Pinia store 状态更新的测试用例：








现在创建 Pinia store 的测试用例：








现在创建 API 请求拦截器的测试用例：










现在创建 API 请求拦截器的测试用例：













现在创建 Login 组件的测试用例：















现在创建 Login 组件的测试用例：


















现在创建 Register 组件的测试用例：























现在创建 Register 组件的测试用例：


























现在让我运行测试来验证所有测试用例：


























现在运行测试来验证所有测试用例：




测试运行了，有一些失败需要修复。让我分析并修复这些问题：




让我修复这些测试失败的问题。首先修复 API 测试：






让我修复 API 测试中的请求拦截器测试，直接测试拦截器 handler：






现在修复 auth store 测试中的 getUserInfo 函数名问题：








让我检查一下 auth store 中实际的方法名：










方法名确实是 `getUserInfo`，我刚才改错了。让我恢复：













我发现问题了！在 Pinia store 中，getter 和 action 有相同的名称 `getUserInfo`，这会导致命名冲突。让我修改测试来正确地解决这个问题：




我发现了问题！在 Pinia store 中，getter 和 action 有相同的名称 `getUserInfo`，导致了命名冲突。让我修改测试来通过 `$actions` 访问 action：








现在修复 Login 和 Register 组件的错误处理测试，需要确保 mock 正确配置：












让我修复组件测试中的 ElMessage mock 问题。问题在于 mock 的方式需要调整：
















让我修改 Login 和 Register 组件测试，使用更可靠的方式来 mock ElMessage：
















现在更新 Login.test.ts 中所有使用 mockElMessage 的地方：


















现在对 Register.test.ts 做同样的修改：


















现在让我在组件测试的 beforeEach 中添加对 mock 函数的重置：


















现在重新运行测试，看看是否修复了所有问题：



















还有几个问题需要修复：
1. Login.test.ts 中缺少 Login 组件的导入
2. auth store 测试中 $actions 不可用
3. Register 组件的错误处理测试仍然失败

让我逐一修复：

















现在修复 auth store 测试中的 $actions 问题。由于 getter 和 action 同名的问题，让我直接修改 store 测试来避免这个问题：




















现在让我修复 Register 组件的错误处理测试。让我查看 Register.vue 看看错误是如何处理的：






















让我重新运行测试，看看修复后的结果：























我发现问题了！auth store 中的 getter 和 action 有相同的名称 `getUserInfo`，这导致了命名冲突。让我修复 store 中的命名冲突：


























现在更新 auth store 测试文件中的 getter 引用：


























现在更新 auth store 测试中 getUserInfo action 的测试：



























现在我需要更新 Login.vue 和 Register.vue 中对 getter 的使用，因为我修改了 getter 的名称：




























我需要更新组件中对 getter 的引用。让我更新 Login.vue、Register.vue 和 Home.vue：






























现在让我修复组件测试中的 ElMessage 问题，添加更多的等待时间：





























现在重新运行测试：






























让我检查测试中还有哪些地方使用了旧的 getter 名称：



























我发现问题了！在 Pinia 中，getter 和 state 同名会导致冲突。让我恢复 getter 的原始命名，但修改 action 的名称来避免冲突：





























现在修改 action 的名称来避免和 getter 冲突：






























现在更新 Home.vue 中对 action 的调用：






























现在更新组件中对 getter 的使用，恢复为原始的 getter 名称：






























现在更新 auth store 测试文件，恢复 getter 名称并更新 action 名称：
































现在更新 auth store 测试中的 action 名称：
































现在重新运行测试：


































完美！所有 85 个测试都通过了！现在让我更新任务列表并运行覆盖率测试：


































现在运行覆盖率测试来查看测试覆盖情况：


































完美！所有测试和覆盖率测试都通过了！现在让我完成最后的任务：


































完美！我已经成功为登录注册流程添加了完整的测试覆盖。以下是完成的工作总结：

## ✅ 测试覆盖完成

### 📊 测试结果
- **总测试数**：85 个测试用例全部通过
- **测试覆盖率**：
  - 语句覆盖：76.03%
  - 分支覆盖：78.76%
  - 函数覆盖：68.91%
  - 行覆盖：77.37%

### 📁 创建的测试文件

1. **`src/utils/validation.test.ts`** - 表单校验工具测试
   - 手机号码验证（有效/无效）
   - 电子邮箱验证（有效/无效）
   - 身份证号验证（有效/无效）
   - 密码强度验证（有效/无效）
   - 整体表单验证（所有字段、多字段错误、可选字段）

2. **`src/store/auth.test.ts`** - Pinia Store 状态管理测试
   - 初始状态验证
   - Getters 测试
   - Login action（成功/失败/加载状态）
   - Register action（成功/失败/加载状态）
   - fetchUserInfo action（成功/失败/加载状态）
   - Logout action（成功/失败/加载状态）
   - clearState action

3. **`src/services/api.test.ts`** - API 请求拦截器测试
   - 请求拦截器（有 token/无 token/错误处理）
   - 响应拦截器（200/401/403/404/500/网络错误/配置错误）
   - 所有 API 函数的 mock 数据验证

4. **`src/views/Login.test.ts`** - 登录组件测试
   - 表单渲染
   - 所有字段的 blur 验证
   - 验证码发送流程（验证手机号、倒计时）
   - 登录流程（成功/失败/加载状态）
   - 导航链接验证

5. **`src/views/Register.test.ts`** - 注册组件测试
   - 表单渲染
   - 所有 6 个字段的 blur 验证
   - 注册流程（成功/失败/加载状态）
   - 多字段错误检测
   - 导航链接验证

### 🔧 修复的问题

在测试过程中发现并修复了以下代码问题：

1. **命名冲突**：将 auth store 中的 action 从 `getUserInfo` 改为 `fetchUserInfo`，避免与 getter 重名
2. **Home.vue**：更新了对 store getter 和 action 的引用

### 🚀 如何运行测试

```bash
# 运行测试（监听模式）
npm run test

# 运行测试（单次运行）
npm run test:run

# 运行测试并生成覆盖率报告
npm run test:coverage
```

覆盖率报告将生成在 `frontend/coverage/` 目录下。

### 🎯 测试策略

所有测试都采用了 **mock 接口层独立验证前端逻辑** 的策略：
- 使用 `vi.mock()` 模拟 API 服务层
- 使用 `vi.mock()` 模拟 crypto 工具函数
- 使用 `vi.mock()` 模拟 Element Plus 的 ElMessage 组件
- 这样可以完全独立地测试前端业务逻辑，不依赖真实的后端服务

## User
把类型检查调通，保证项目能稳定通过 TypeScript 校验

## Assistant
让我先运行 TypeScript 类型检查来找出问题：

vue-tsc 有兼容性问题。让我检查一下版本并尝试使用更稳定的方式：


vue-tsc 版本太旧，与新 Node.js 版本不兼容。让我更新到兼容的版本：




让我更新 vue-tsc 到兼容 Node.js 24 的版本：






让我先检查命令状态，同时尝试使用 tsc 直接进行类型检查：




现在让我运行类型检查：








让我逐一修复这些 TypeScript 错误：










首先修复 api.test.ts 中的类型错误：
















让我重新设计 api.test.ts，使用更好的方式来测试拦截器并修复类型问题：




















现在修复 api.ts 中未使用的参数：




















现在修复 Home.vue 中的 UserInfo 类型问题。让我先查看类型定义：
























现在修复 Login.vue 中的导入和命名冲突：

























现在重新运行类型检查：




























完美！类型检查通过了。让我再运行一次测试确保所有功能正常：






































完美！所有测试都通过了。让我完成最后的任务：








































## ✅ TypeScript 类型检查已完全通过！

所有问题已修复，项目现在可以稳定通过 TypeScript 校验：

### 📋 修复的问题

1. **更新 vue-tsc 版本**：从 `^1.8.22` 更新到 `^2.1.0`，解决与 Node.js 24 的兼容性问题

2. **`src/services/api.test.ts`**：
   - 移除未使用的 `axios` 导入
   - 使用 `(as any)` 类型断言访问 `handlers` 属性

3. **`src/services/api.ts`**：
   - 将未使用的参数 `data` 重命名为 `_data`（`register` 和 `sendVerificationCode` 函数）

4. **`src/store/auth.ts`**：
   - 在 `UserInfo` 接口中添加可选属性：`idCard`、`address`、`createdAt`

5. **`src/views/Login.vue`**：
   - 移除未使用的 `computed` 导入
   - 移除未使用的 `apiSendVerificationCode` 导入（原 `sendVerificationCode` 重命名后发现未使用）

### ✅ 验证结果

```bash
# TypeScript 类型检查
npm run typecheck
✅ 通过

# 单元测试
npm run test:run
✅ 85 个测试用例全部通过
```

项目现在已完全配置好 TypeScript 类型检查，所有测试和类型校验都可以稳定通过！

