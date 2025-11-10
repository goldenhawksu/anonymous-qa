
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
