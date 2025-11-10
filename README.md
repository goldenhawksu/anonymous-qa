
# 匿名提问平台 - Vercel 部署指南

## 📦 项目结构

```
anonymous-qa-platform/
├── pages/
│   ├── _app.js
│   └── index.js
├── styles/
│   └── globals.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🚀 快速部署到 Vercel

### 方法一：通过 Git 部署（推荐）

1. **创建项目文件夹并初始化**
   ```bash
   mkdir anonymous-qa-platform
   cd anonymous-qa-platform
   git init
   ```

2. **创建所有文件**
   - 将上面提供的所有代码文件放入对应位置
   - 创建 `pages`、`styles` 文件夹

3. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

4. **在 Vercel 上部署**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Import Project"
   - 选择你的 GitHub 仓库
   - Vercel 会自动检测 Next.js 项目并配置
   - 点击 "Deploy" 即可

### 方法二：通过 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **在项目目录下部署**
   ```bash
   cd anonymous-qa-platform
   vercel
   ```

3. **按照提示操作**
   - 登录 Vercel 账号
   - 确认项目设置
   - 等待部署完成

## 💻 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **访问应用**
   - 打开浏览器访问 `http://localhost:3000`

## 📱 使用说明

### 用户端（手机）
1. 访问部署后的网址
2. 默认显示"用户视图"
3. 在输入框输入问题并提交
4. 点击其他问题的票数按钮进行"同问"
5. 问题实时更新，按票数排序

### 大屏端（会议屏幕）
1. 访问部署后的网址
2. 点击右上角切换到"大屏视图"
3. 实时显示所有问题，票数最高的排在前面
4. 自动刷新，无需手动操作

## ✨ 功能特点

- ✅ **完全匿名**：无需登录，保护隐私
- ✅ **实时同步**：使用 localStorage + 轮询实现实时更新
- ✅ **防重复投票**：每个设备只能对同一问题投一票
- ✅ **响应式设计**：手机和大屏自适应
- ✅ **现代动画**：使用 Framer Motion 提供流畅体验
- ✅ **零成本部署**：Vercel 免费套餐即可使用

## 🔧 进阶配置

### 自定义域名
在 Vercel 项目设置中添加自定义域名

### 环境变量
如需添加后端 API，在 Vercel 项目设置中配置环境变量

### 数据持久化升级
当前使用 localStorage（单机存储），若需多设备同步，可升级为：
- **Firebase Realtime Database**（推荐）
- **Supabase**（开源替代）
- **自建 WebSocket 服务**

## 📝 注意事项

⚠️ **当前版本使用 localStorage 存储**
- 数据存储在浏览器本地
- 不同设备间不共享数据
- 适合小型会议或演示使用

⚠️ **生产环境建议**
对于正式会议，建议升级到云数据库方案以实现真正的多设备同步。

## 🆘 常见问题

**Q: 手机提交的问题大屏看不到？**
A: 当前版本使用本地存储，需要在同一设备上切换视图。生产环境请使用云数据库方案。

**Q: 如何清空所有问题？**
A: 打开浏览器控制台，执行 `localStorage.removeItem('questions')`

**Q: 如何修改主题颜色？**
A: 在代码中搜索 `purple-500`、`pink-500` 等类名进行替换

## 📄 许可证

MIT License - 自由使用和修改

~~~~~~~~~~~~~

# Firebase 实时数据库设置指南

## 🔥 第一步：创建 Firebase 项目

1. **访问 Firebase Console**
   - 打开 https://console.firebase.google.com/
   - 使用 Google 账号登录

2. **创建新项目**
   - 点击"添加项目"
   - 输入项目名称（如：anonymous-qa）
   - 禁用 Google Analytics（可选）
   - 点击"创建项目"

## 📱 第二步：注册 Web 应用

1. **添加应用**
   - 在项目概览页面，点击 Web 图标（</>）
   - 输入应用昵称（如：QA Platform）
   - **不要**勾选 Firebase Hosting
   - 点击"注册应用"

2. **获取配置信息**
   - 复制 `firebaseConfig` 对象中的所有值
   - 保存备用

## 💾 第三步：启用 Realtime Database

1. **创建数据库**
   - 左侧菜单选择"构建" > "Realtime Database"
   - 点击"创建数据库"

2. **选择位置**
   - 选择离您最近的区域（建议：asia-southeast1）
   - 点击"下一步"

3. **设置安全规则**
   - 选择"以**测试模式**启动"（重要！）
   - 点击"启用"

4. **配置安全规则**（重要！）
   - 在"规则"标签页，将规则改为：
   ```json
   {
     "rules": {
       "questions": {
         ".read": true,
         ".write": true,
         "$questionId": {
           ".validate": "newData.hasChildren(['text', 'votes', 'timestamp', 'votedBy'])"
         }
       }
     }
   }
   ```
   - 点击"发布"

## ⚙️ 第四步：配置项目

### 本地开发

1. **创建环境变量文件**
   ```bash
   # 在项目根目录创建 .env.local 文件
   touch .env.local
   ```

2. **填入 Firebase 配置**
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=你的_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=你的项目.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://你的项目.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=你的项目ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=你的项目.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=你的SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID=你的APP_ID
   ```

3. **测试本地运行**
   ```bash
   npm install
   npm run dev
   ```

### Vercel 部署配置

1. **在 Vercel 项目设置中添加环境变量**
   - 登录 Vercel Dashboard
   - 选择你的项目
   - 进入 Settings > Environment Variables
   - 逐个添加上面的环境变量（不需要引号）

2. **重新部署**
   - Vercel 会自动重新部署
   - 或手动触发重新部署

## 🔒 安全规则说明

### 测试阶段（当前配置）
```json
{
  "rules": {
    "questions": {
      ".read": true,
      ".write": true
    }
  }
}
```
- ✅ 任何人都可以读写
- ✅ 适合开发和小型会议
- ⚠️ 没有数据验证

### 生产环境（推荐）
```json
{
  "rules": {
    "questions": {
      ".read": true,
      ".write": true,
      "$questionId": {
        ".validate": "newData.hasChildren(['text', 'votes', 'timestamp', 'votedBy']) && newData.child('text').isString() && newData.child('text').val().length > 0 && newData.child('text').val().length <= 500 && newData.child('votes').isNumber() && newData.child('timestamp').isNumber()"
      }
    }
  }
}
```
- ✅ 验证数据结构
- ✅ 限制文本长度（500字符）
- ✅ 验证数据类型

## 📁 完整项目结构

```
anonymous-qa-platform/
├── lib/
│   └── firebase.js          ← Firebase 初始化
├── pages/
│   ├── _app.js
│   └── index.js             ← 主应用（已更新）
├── styles/
│   └── globals.css
├── .env.local               ← 本地环境变量（不要提交到 Git）
├── .env.local.example       ← 环境变量模板
├── .gitignore               ← 添加 .env.local
├── package.json             ← 已添加 firebase 依赖
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 部署步骤

1. **创建 lib 目录和 firebase.js**
   ```bash
   mkdir lib
   # 将 firebase.js 代码保存到 lib/firebase.js
   ```

2. **更新 .gitignore**
   ```
   .env.local
   .env*.local
   ```

3. **安装新依赖**
   ```bash
   npm install
   ```

4. **提交到 Git**
   ```bash
   git add .
   git commit -m "Add Firebase realtime sync"
   git push
   ```

5. **在 Vercel 配置环境变量**
   - 按照上面的说明添加所有 Firebase 环境变量

## ✅ 测试清单

- [ ] Firebase 项目已创建
- [ ] Realtime Database 已启用
- [ ] 安全规则已配置
- [ ] 环境变量已添加（本地 + Vercel）
- [ ] 本地测试成功
- [ ] Vercel 部署成功
- [ ] 多设备测试：手机提问 → 大屏显示 ✓
- [ ] 多设备测试：其他设备同问 ✓

## 🎯 新功能

### 用户端
- ✅ 实时同步状态指示器
- ✅ 任何设备提交问题，所有设备立即看到
- ✅ 防止重复投票（基于设备ID）
- ✅ 自动按票数排序

### 大屏端
- ✅ 实时显示所有问题
- ✅ 显示 TOP 10
- ✅ 管理功能：删除单个问题
- ✅ 管理功能：一键清空所有问题

## 🆘 常见问题

**Q: 提交问题后没有显示？**
A: 检查浏览器控制台错误，确认 Firebase 配置正确

**Q: 显示"Permission denied"？**
A: 检查 Firebase 安全规则是否正确配置

**Q: Vercel 部署失败？**
A: 确认所有环境变量都已在 Vercel 中配置

**Q: 本地运行但 Vercel 不行？**
A: 检查环境变量名称是否完全一致（包括 NEXT_PUBLIC_ 前缀）

## 💡 进阶功能（可选）

- 添加问题分类
- 添加问题状态（已回答/未回答）
- 添加演讲者视图（标记问题为已回答）
- 导出问题列表
- 设置会议房间（多会议支持）

