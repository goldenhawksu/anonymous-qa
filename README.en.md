# Firebase Realtime Database Setup Guide

## 📁 Complete Project Structure

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

## 🔥 Step 1: Create Firebase Project

1. **Visit Firebase Console**
   - Go to https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click "Add project"
   - Enter project name (e.g., anonymous-qa)
   - Disable Google Analytics (optional)
   - Click "Create project"

## 📱 Step 2: Register Web Application

1. **Add Application**
   - On project overview page, click Web icon (</>)
   - Enter app nickname (e.g., QA Platform)
   - **Do NOT** check Firebase Hosting
   - Click "Register app"

2. **Get Configuration**
   - Copy all values from `firebaseConfig` object
   - Save for later use

## 💾 Step 3: Enable Realtime Database

1. **Create Database**
   - Select "Build" > "Realtime Database" from left menu
   - Click "Create database"

2. **Choose Location**
   - Select the region closest to you (recommended: asia-southeast1)
   - Click "Next"

3. **Set Security Rules**
   - Select "Start in **test mode**" (Important!)
   - Click "Enable"

4. **Configure Security Rules** (Important!)
   - In "Rules" tab, change rules to:
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
   - Click "Publish"

## 🔒 Firebase Security Rules Explanation

### Production Environment (Recommended)

- ✅ Copy the content from firebase-rules.json to the "Rules" page in Firebase Realtime Database and publish

## ⚙️ Step 4: Configure Project

### Local Development

1. **Create Environment Variables File**
   ```bash
   # Create .env.local file in project root
   touch .env.local
   ```

2. **Fill in Firebase Configuration**
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your-project-default-rtdb.asia-southeast1.firebasedatabase.app
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-SENDER-ID
   NEXT_PUBLIC_FIREBASE_APP_ID=your-APP-ID
   NEXT_PUBLIC_ADMIN_PASSWORD=Admin123
   ```

3. **Test Local Run**
   ```bash
   npm install
   npm run dev
   ```

### Vercel Deployment Configuration

1. **Add Environment Variables in Vercel Project Settings**
   - Log in to Vercel Dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add each environment variable above (no quotes needed)

2. **Redeploy**
   - Vercel will automatically redeploy
   - Or manually trigger redeployment

## 🎯 New Features

### 🌐 Language & Theme Switching
- ✅ **Bilingual Support**: Switch between Chinese (中文) and English
- ✅ **8 Beautiful Themes**: Purple Pink, Ocean Blue, Sunset Orange, Forest Green, Lavender, Cherry Blossom, Sky Blue, Mint Green
- ✅ **Settings Persistence**: Language and theme preferences saved in localStorage
- ✅ **Dropdown Menus**: Easy-to-use theme and language switchers in top navigation bar

### User View
- ✅ Real-time sync status indicator
- ✅ Submit questions from any device, visible to all instantly
- ✅ Prevent duplicate voting (device ID-based)
- ✅ Auto-sort by vote count
- ✅ Reply to questions with threaded discussions
- ✅ Users can delete their own questions (with confirmation)

### Display View
- ✅ Real-time display of all questions
- ✅ Show TOP 10 questions
- ✅ Admin function: Delete individual questions
- ✅ Admin function: Clear all questions with one click
- ✅ Admin function: Cleanup stale rooms (30+ days inactive)

### Multi-Room Support
- ✅ Dynamic room switching via URL parameter (?room=name)
- ✅ Room manager with quick access and recent visits
- ✅ Create new rooms on-the-fly
- ✅ Copy room link to clipboard
- ✅ Auto room cleanup (10+ days inactive)

## 🆘 Frequently Asked Questions

**Q: Questions not showing after submission?**
A: Check browser console for errors, confirm Firebase configuration is correct

**Q: Seeing "Permission denied"?**
A: Check if Firebase security rules are correctly configured

**Q: Vercel deployment failed?**
A: Ensure all environment variables are configured in Vercel

**Q: Works locally but not on Vercel?**
A: Check if environment variable names are exactly the same (including NEXT_PUBLIC_ prefix)

**Q: How to switch language?**
A: Click the language icon (🌐) in the top-right corner and select your preferred language

**Q: How to change theme?**
A: Click the palette icon (🎨) in the top-right corner and choose from 8 beautiful themes

---

## 📖 Documentation

- **English**: [README.en.md](README.en.md)
- **中文**: [README.md](README.md)

## 🌟 Features Highlights

### 🎨 Customization
- **8 Theme Options**: Choose your favorite color scheme
  - 🌸 Purple Pink (Default)
  - 🌊 Ocean Blue
  - 🌅 Sunset Orange
  - 🌲 Forest Green
  - 💜 Lavender
  - 🌸 Cherry Blossom
  - ☁️ Sky Blue
  - 🍃 Mint Green

### 🌏 Internationalization
- **Bilingual Interface**: Full support for Chinese and English
- **Auto-detection**: Remembers your language preference
- **Seamless Switching**: Change language anytime without page reload

### 🏢 Multi-Room Architecture
- **Isolated Spaces**: Each room maintains its own questions
- **URL-based Access**: Share specific room links
- **Room History**: Quick access to recently visited rooms
- **Auto Cleanup**: Remove inactive rooms automatically

### 🛡️ Security & Rate Limiting
- **Client-side Rate Limiting**: Prevents spam and abuse
- **Password-protected Admin**: Secure management functions
- **Device ID Tracking**: Prevent duplicate voting
- **User Ownership**: Users can only delete their own questions

## 🚀 Quick Start

1. Clone the repository
2. Copy `.env.local.example` to `.env.local`
3. Fill in your Firebase credentials
4. Run `npm install`
5. Run `npm run dev`
6. Open http://localhost:3000

## 📱 Usage Scenarios

- **Meetings & Conferences**: Audience Q&A sessions
- **Classrooms**: Student questions in real-time
- **Events**: Live audience interaction
- **Webinars**: Remote participant engagement
- **Town Halls**: Anonymous feedback collection

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Firebase Realtime Database
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📄 License & Support

This project is fully open source under the **[MIT License](LICENSE)**, allowing you to freely use it in any personal or commercial projects.

I would be delighted if you could consider **buying me a coffee** ☕️ to support my work.

Your support is my greatest motivation!

<a href="https://buymeacoffee.com/suweihongc">
  <img src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;" >
</a>

You can also support via WeChat or Alipay:

<img src="https://get.spdt.work/FreeAI_pay.jpg" alt="Donation QR Code" width="200">

Thank you so much for every supporter!
