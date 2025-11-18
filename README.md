# Firebase 实时数据库设置指南

## 📁 完整项目结构

```
anonymous-qa/
├── lib/
│   ├── firebase.js          # Firebase initialization and configuration
│   ├── rateLimit.js         # Client-side rate limiter (anti-abuse)
│   ├── roomCleanup.js       # Meeting room auto-cleanup tool
│   ├── i18n.js              # Internationalization (i18n) configuration
│   └── themes.js            # Theme configuration (8 themes)
├── pages/
│   ├── _app.js              # Next.js application entry
│   └── index.js             # Main app (User View + Display View + Room Management)
├── styles/
│   └── globals.css          # Global styles
├── .env.local               # Local environment variables (not committed to Git)
├── .env.local.example       # Environment variable template
├── package.json             # Project dependencies
├── tailwind.config.js       # Tailwind configuration
└── postcss.config.js        # PostCSS configuration
```

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
         "rooms": {
            "$roomId": {
               ".read": true,
               ".write": true,
               "questions": {
                  ".read": true,
                  ".write": true,
                  "$questionId": {
                     ".validate": "newData.hasChildren(['text', 'votes', 'timestamp'])"           
                  }
               }
            }
         }
      }
   }
   ```
   - 点击"发布"

## 🔒 Firebase安全规则说明


### 生产环境（推荐）

- ✅ 把firebase-rules.json里的内容粘贴至firebase的实时数据库里的“规则”页，发布

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
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=你的项目-default-rtdb.asia-southeast1.firebasedatabase.app
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=你的项目ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=你的项目.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=你的SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID=你的APP_ID
   NEXT_PUBLIC_ADMIN_PASSWORD=Admin123
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

---

## 授权许可 & 支持项目

本项在 **[MIT License](LICENSE)** 许可下完全开源，您可以自由地在任何个人或商业项目中使用。

我将非常高兴您能考虑**请我喝杯咖啡** ☕️ 来支持我的工作，您的支持是我的最大动力！

<a href="https://buymeacoffee.com/suweihongc">
  <img src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;" >
</a>

您也可以通过微信或支付宝赞赏：

<img src="https://get.spdt.work/FreeAI_pay.jpg" alt="赞赏码" width="200">

非常感谢每一位支持者！
