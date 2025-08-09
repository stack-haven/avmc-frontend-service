# 项目规则文档

## 项目概述

这是一个基于 Vue 3 和 TypeScript 的前端项目，采用 Monorepo 架构，包含多个子应用和共享包。

## 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **包管理**: pnpm + Turborepo
- **UI 框架**: Ant Design Vue / Element Plus / Naive UI
- **状态管理**: Pinia
- **路由**: Vue Router
- **代码规范**: ESLint + Prettier + Stylelint
- **测试**: Vitest + Playwright

## 项目结构

### 目录说明

```
avmc-frontend-service/
├── apps/                 # 应用目录
│   ├── avmc-admin/      # 管理后台
│   ├── web-antd/        # Ant Design Vue 版本
│   ├── web-ele/         # Element Plus 版本
│   ├── web-naive/       # Naive UI 版本
│   └── backend-mock/    # 后端模拟服务
├── packages/            # 共享包目录
│   ├── @core/          # 核心功能
│   ├── constants/      # 常量定义
│   ├── effects/        # 副作用处理
│   ├── icons/          # 图标库
│   ├── locales/        # 国际化
│   ├── stores/         # 状态管理
│   ├── styles/         # 样式库
│   ├── types/          # 类型定义
│   └── utils/          # 工具函数
├── internal/           # 内部配置
├── docs/              # 文档
└── playground/        # 测试环境
```

## 开发规范

### 代码规范

#### 1. 命名规范

- **变量名**: 驼峰命名法，具有描述性
  - 正确: `userName`, `isLoading`
  - 错误: `a`, `temp`, `data`

- **常量名**: 全大写，下划线分隔
  - 正确: `API_BASE_URL`, `MAX_RETRY_COUNT`
  - 错误: `apiBaseUrl`, `maxRetry`

- **函数名**: 动词+名词组合，清晰表达功能
  - 正确: `getUserInfo()`, `validateForm()`
  - 错误: `user()`, `check()`

- **文件名**: 小写，使用连字符分隔
  - 正确: `user-service.ts`, `api-config.ts`
  - 错误: `UserService.ts`, `apiConfig.ts`

#### 2. 注释规范

所有函数必须包含函数级注释：

```typescript
/**
 * 获取用户信息
 * @param userId - 用户ID
 * @param includeProfile - 是否包含用户档案
 * @returns 返回用户信息对象
 * @example
 * const user = await getUserInfo('123', true)
 */
async function getUserInfo(
  userId: string,
  includeProfile: boolean = false,
): Promise<User> {
  // 实现代码
}
```

#### 3. 代码组织

- 相关功能代码应该组织在同一个模块中
- 保持单一职责原则
- 适当抽象和封装重复代码
- 控制函数长度，建议不超过50行

#### 4. 错误处理

- 所有错误必须得到适当处理
- 提供有意义的错误信息
- 关键操作需要添加错误日志

```typescript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('API调用失败:', error);
  throw new Error(`获取数据失败: ${error.message}`);
}
```

### TypeScript 规范

#### 1. 类型定义

- 优先使用接口定义对象类型
- 使用类型别名定义联合类型和复杂类型
- 避免使用 `any` 类型

```typescript
// 好的做法
interface User {
  id: string;
  name: string;
  email: string;
}

type UserStatus = 'active' | 'inactive' | 'pending';

// 避免的做法
type User = any;
```

#### 2. 泛型使用

- 在需要类型安全的地方使用泛型
- 为泛型参数提供有意义的名称

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
```

### Vue 规范

#### 1. 组件结构

```vue
<template>
  <!-- 模板代码 -->
</template>

<script setup lang="ts">
// 导入语句
import { ref, computed } from 'vue';

// 类型定义
interface Props {
  title: string;
  disabled?: boolean;
}

// Props 和 Emits
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

// 状态管理
const count = ref(0);

// 计算属性
const doubleCount = computed(() => count.value * 2);

// 方法定义
function handleClick() {
  emit('click', event);
}
</script>

<style scoped>
/* 样式代码 */
</style>
```

#### 2. 组件命名

- 使用 PascalCase 命名组件文件
- 使用 kebab-case 命名组件标签

```typescript
// 文件命名: UserCard.vue
// 使用: <user-card />
```

### 样式规范

#### 1. Tailwind CSS 使用

- 优先使用 Tailwind 的原子类
- 避免内联样式
- 自定义样式使用 `@layer` 指令

```css
@layer components {
  .btn-primary {
    @apply rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600;
  }
}
```

#### 2. 响应式设计

- 移动端优先
- 使用断点前缀：`sm:`, `md:`, `lg:`, `xl:`

### Git 规范

#### 1. 提交信息

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型说明：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：

```
feat(auth): 添加用户登录功能

实现了用户登录表单和验证逻辑
支持邮箱和密码登录方式

Closes #123
```

#### 2. 分支管理

- `main`: 主分支，生产环境代码
- `develop`: 开发分支，集成测试
- `feature/*`: 功能开发分支
- `fix/*`: 问题修复分支
- `hotfix/*`: 紧急修复分支

### 测试规范

#### 1. 单元测试

- 核心功能必须编写单元测试
- 测试用例需要考虑边界条件
- 保持测试代码的可维护性

```typescript
describe('UserService', () => {
  it('应该正确获取用户信息', async () => {
    const user = await getUserInfo('123');
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
  });

  it('应该处理用户不存在的情况', async () => {
    await expect(getUserInfo('999')).rejects.toThrow('用户不存在');
  });
});
```

#### 2. 端到端测试

- 使用 Playwright 进行关键流程测试
- 覆盖主要用户场景

### 环境配置

#### 1. 环境变量

- 使用 `.env` 文件管理环境变量
- 为不同环境创建对应的配置文件

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=AVMC Frontend (Dev)
```

#### 2. 构建配置

- 使用 Vite 进行构建配置
- 支持多环境构建

### 性能优化

#### 1. 代码分割

- 使用动态导入进行路由级别的代码分割
- 按需加载第三方库

```typescript
const routes = [
  {
    path: '/user',
    component: () => import('./views/User.vue'),
  },
];
```

#### 2. 资源优化

- 图片资源使用 WebP 格式
- 启用 Gzip 压缩
- 使用 CDN 加速静态资源

### 安全规范

#### 1. 数据安全

- 敏感信息使用环境变量存储
- 用户输入必须进行验证和转义
- 使用 HTTPS 进行 API 通信

#### 2. 依赖安全

- 定期更新依赖包
- 使用 `pnpm audit` 检查安全漏洞

### 部署规范

#### 1. Docker 部署

- 使用多阶段构建优化镜像大小
- 非 root 用户运行应用

#### 2. 健康检查

- 提供健康检查端点
- 监控关键指标

### 文档规范

#### 1. 代码文档

- 为公共 API 编写 JSDoc
- 更新 README 文件

#### 2. 变更日志

- 维护 CHANGELOG.md
- 记录重要的设计决策

### 开发工作流

1. **克隆项目**

   ```bash
   git clone <repository-url>
   pnpm install
   ```

2. **创建功能分支**

   ```bash
   git checkout -b feature/new-feature
   ```

3. **开发代码**
   - 遵循代码规范
   - 编写测试
   - 运行 lint 检查

4. **提交代码**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **推送并创建 PR**

   ```bash
   git push origin feature/new-feature
   ```

6. **代码审查**
   - 至少一个审查者
   - 解决审查意见
   - 合并到主分支

### 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 格式化代码
pnpm format
```

### 故障排查

#### 1. 常见问题

- **依赖安装失败**: 清除缓存 `pnpm store prune`
- **构建失败**: 检查环境变量配置
- **类型错误**: 运行 `pnpm type-check`

#### 2. 调试技巧

- 使用 Vue DevTools
- 启用 source map
- 使用断点调试

## 更新日志

- 2024-01-01: 初始版本
- 2024-01-15: 添加 TypeScript 规范
- 2024-02-01: 更新测试规范
- 2024-02-15: 添加性能优化指南
