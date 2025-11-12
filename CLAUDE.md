# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**anonymous-qa** 是一个基于 Next.js 和 Firebase 实时数据库的匿名问答平台。设计用于会议、演讲等场景，支持观众匿名提问、实时同问投票，并提供大屏展示界面。

### 核心功能

- **双视图架构**：用户视图（提问端）+ 大屏视图（展示端）
- **实时同步**：基于 Firebase Realtime Database 的实时数据同步
- **防重复投票**：使用设备 ID 机制防止同一设备多次投票
- **管理功能**：密码保护的管理模式，支持删除问题和清空所有问题
- **响应式设计**：完整支持手机、平板、桌面和大屏显示

## 技术栈

### 前端框架
- **Next.js 14**: React 框架，SSR/SSG 支持
- **React 18**: UI 库
- **Framer Motion**: 动画库
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Lucide React**: 图标库

### 后端服务
- **Firebase Realtime Database**: NoSQL 实时数据库
- **Vercel**: 推荐的部署平台（支持自动部署和环境变量管理）

## 项目结构

```
anonymous-qa/
├── lib/
│   └── firebase.js          # Firebase 初始化和配置
├── pages/
│   ├── _app.js              # Next.js 应用入口
│   └── index.js             # 主应用（用户视图 + 大屏视图）
├── styles/
│   └── globals.css          # 全局样式
├── .env.local               # 本地环境变量（不提交到 Git）
├── .env.local.example       # 环境变量模板
├── package.json             # 项目依赖
├── tailwind.config.js       # Tailwind 配置
└── postcss.config.js        # PostCSS 配置
```

## 常用命令

### 开发环境

```bash
# 安装依赖
npm install

# 本地开发（http://localhost:3000）
npm run dev

# 构建生产版本
npm build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

### 环境配置

1. **创建本地环境变量文件**
   ```bash
   cp .env.local.example .env.local
   ```

2. **填写 Firebase 配置**（从 Firebase Console 获取）
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`（重要：必须是 Realtime Database URL）
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`（管理员密码，自定义）

## 核心架构

### 数据模型

Firebase Realtime Database 结构：

```json
{
  "questions": {
    "question_id_1": {
      "text": "问题文本",
      "votes": 0,
      "timestamp": 1234567890,
      "votedBy": {
        "device_id_1": true,
        "device_id_2": true
      }
    }
  }
}
```

### 关键字段说明

- `text` (string): 问题内容，1-500 字符
- `votes` (number): 当前票数（同问数）
- `timestamp` (number): 创建时间戳
- `votedBy` (object): 投票记录，key 为设备 ID，value 为 true

### 数据流

```
用户提交问题 → Firebase Realtime Database → 实时同步到所有连接的客户端
用户投票 → 更新 votes 和 votedBy → 实时同步排序
管理员删除 → Firebase remove() → 所有客户端自动更新
```

## Firebase 配置要点

### 安全规则（测试环境）

```json
{
  "rules": {
    "questions": {
      ".read": true,
      ".write": true,
      ".indexOn": ["votes", "timestamp"]
    }
  }
}
```

### 安全规则（生产环境推荐）

```json
{
  "rules": {
    "questions": {
      ".read": true,
      ".write": true,
      ".indexOn": ["votes", "timestamp"],
      "$questionId": {
        ".validate": "newData.val() === null || (newData.hasChildren(['text', 'votes', 'timestamp']) && newData.child('text').isString() && newData.child('text').val().length > 0 && newData.child('text').val().length <= 500 && newData.child('votes').isNumber() && newData.child('votes').val() >= 0 && newData.child('timestamp').isNumber())"
      }
    }
  }
}
```

### 关键配置注意事项

1. **数据库 URL 格式**：必须是 `https://项目名-default-rtdb.地区.firebasedatabase.app`
2. **区域选择**：建议中国用户选择 `asia-southeast1`（新加坡）
3. **索引优化**：已在 `.indexOn` 中配置 `votes` 和 `timestamp` 索引以提升查询性能

## 关键功能实现

### 设备 ID 管理（防重复投票）

```javascript
// 在 localStorage 中生成和存储唯一设备 ID
let id = localStorage.getItem('deviceId');
if (!id) {
  id = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  localStorage.setItem('deviceId', id);
}
```

### 实时同步监听

```javascript
// 使用 onValue 监听数据变化
const questionsRef = ref(database, 'questions');
const unsubscribe = onValue(questionsRef, (snapshot) => {
  const data = snapshot.val();
  // 处理数据更新
});
```

### 投票逻辑

- **投票**：`votes + 1`，在 `votedBy` 中添加设备 ID
- **取消投票**：`votes - 1`，从 `votedBy` 中移除设备 ID
- **客户端排序**：按 `votes` 降序排列
- **大屏显示**：仅显示 Top 10

### 管理功能

- **认证机制**：基于环境变量 `NEXT_PUBLIC_ADMIN_PASSWORD` 的简单密码认证
- **会话管理**：使用 `sessionStorage` 存储认证状态（刷新页面后失效）
- **删除操作**：使用 Firebase `remove()` API
- **清空操作**：使用 Firebase `set(ref, null)`

## 部署指南

### Vercel 部署（推荐）

1. **连接 GitHub 仓库**
   - 在 Vercel Dashboard 导入项目
   - 选择 GitHub 仓库

2. **配置环境变量**
   - 在 Vercel 项目设置中添加所有 `NEXT_PUBLIC_*` 环境变量
   - 不需要引号，直接粘贴值

3. **自动部署**
   - 推送到 main 分支自动触发部署
   - 或手动点击 "Redeploy" 按钮

### 本地测试部署版本

```bash
npm run build
npm start
# 访问 http://localhost:3000
```

## 开发规范

### 代码风格

- 使用 ES6+ 语法
- React Hooks 优先（useState, useEffect）
- 组件函数式声明
- Tailwind CSS 实用类命名

### 状态管理

- **本地状态**：useState（组件内状态）
- **全局状态**：通过 Firebase 实时同步，无需额外状态管理库
- **持久化**：localStorage（设备 ID）、sessionStorage（管理员认证）

### 错误处理

- Firebase 操作使用 try-catch 包裹
- 显示用户友好的错误信息
- 控制台输出详细调试信息（使用 emoji 前缀区分日志类型）

### 响应式设计

- 移动优先（Mobile First）
- 使用 Tailwind 响应式前缀（`sm:`, `md:`, `lg:`）
- 关键断点：
  - 默认：手机端（< 640px）
  - `sm:`：平板端（≥ 640px）
  - 大屏：使用更大的字体和间距

## 常见问题和解决方案

### 问题：提交问题后没有显示

**排查步骤**：
1. 检查浏览器控制台是否有错误
2. 确认 Firebase 配置正确（特别是 `databaseURL`）
3. 验证 Firebase 安全规则是否允许写入
4. 检查网络连接

### 问题：显示 "Permission denied"

**解决方案**：
- 检查 Firebase Console → Realtime Database → Rules
- 确保规则允许 `.read: true` 和 `.write: true`
- 发布规则后等待几秒生效

### 问题：Vercel 部署成功但功能异常

**排查步骤**：
1. 检查 Vercel 环境变量是否完整配置
2. 确认所有变量名包含 `NEXT_PUBLIC_` 前缀
3. 重新部署项目
4. 查看 Vercel Functions 日志

### 问题：本地运行正常但 Vercel 不正常

**常见原因**：
- 环境变量未在 Vercel 中配置
- 环境变量名称拼写错误
- Firebase 配置值复制时包含了空格或引号

## 性能优化建议

1. **索引优化**：已配置 `votes` 和 `timestamp` 索引
2. **数据限制**：大屏仅显示 Top 10，减少 DOM 节点
3. **动画优化**：使用 Framer Motion 的 `AnimatePresence` 优化列表动画
4. **连接管理**：组件卸载时正确清理 Firebase 监听器（`return () => unsubscribe()`）

## 扩展功能建议

### 近期可实现
- 问题分类/标签
- 问题状态（已回答/未回答）
- 导出问题列表（JSON/CSV）
- 主持人标记问题为"已回答"

### 长期规划
- 多会议房间支持（URL 参数或房间码）
- 用户昵称（可选）
- 问题回复功能
- 数据统计和分析（投票趋势、活跃时段）
- OAuth 认证替代简单密码

## 安全注意事项

1. **管理员密码**：
   - 不要在代码中硬编码
   - 使用强密码（建议 12+ 字符）
   - 定期更换密码

2. **Firebase 规则**：
   - 生产环境使用严格的验证规则
   - 限制文本长度防止滥用
   - 考虑添加速率限制

3. **环境变量**：
   - `.env.local` 不要提交到 Git
   - 在 `.gitignore` 中确保已排除
   - Vercel 环境变量仅团队成员可见

4. **数据清理**：
   - 定期备份重要数据
   - 考虑实现自动过期机制（超过 N 天的问题自动删除）

## 调试技巧

### Firebase 连接状态检查

```javascript
// 在浏览器控制台查看
console.log('🔥 Firebase Config:', firebaseConfig);
console.log('📊 Database reference:', database);
```

### 网络请求监控

- 打开 Chrome DevTools → Network 标签
- 筛选 "WS"（WebSocket）查看 Firebase 实时连接
- 查看 "xhr" 或 "fetch" 确认 API 请求

### 数据状态调试

```javascript
// 在组件中添加
useEffect(() => {
  console.log('📝 Questions updated:', questions);
}, [questions]);
```

## 参考资源

- **Firebase Realtime Database 文档**: https://firebase.google.com/docs/database
- **Next.js 文档**: https://nextjs.org/docs
- **Tailwind CSS 文档**: https://tailwindcss.com/docs
- **Framer Motion 文档**: https://www.framer.com/motion/

## 项目特色

- **零后端成本**：完全基于 Firebase 免费套餐（Spark Plan）
- **即时部署**：Vercel 自动部署，支持预览环境
- **跨平台**：同一 URL，自动适配手机、平板、大屏
- **实时协作**：多设备同时使用，数据实时同步
- **简洁高效**：单文件组件架构，代码清晰易维护
