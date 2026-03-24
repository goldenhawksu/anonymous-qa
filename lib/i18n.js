// 国际化语言配置

export const translations = {
  zh: {
    // 顶部导航
    room: '会议室',
    userView: '用户视图',
    displayView: '大屏视图',

    // 欢迎弹窗
    welcome: '欢迎使用',
    welcomeFeature1: '🏠 多会议室支持：为每个会议创建独立房间',
    welcomeFeature2: '💬 实时互动：提问、投票、回复操作实时同步',
    welcomeFeature3: '📺 大屏展示：会议室大屏显示热门问题',
    welcomeTip: '💡 快速开始：',
    welcomeHint: '点击左上角的',
    welcomeButtonText: '按钮,创建或切换到其他会议室',
    startUsing: '开始使用',

    // 会议室管理
    roomManagement: '会议室管理',
    currentRoom: '当前',
    currentRoomLabel: '当前会议室',
    copyLink: '复制链接',
    copied: '已复制',
    createNewRoom: '创建新会议室',
    enterRoomName: '输入会议室名称（英文/数字）',
    create: '创建',
    roomNameRule: '会议室名只能包含字母、数字、下划线和连字符',
    quickAccess: '快捷访问',
    defaultRoom: '默认会议室',
    defaultRoomDesc: 'CTS-MR25 公共问答区',
    recentVisit: '最近访问',
    clear: '清除',
    clearRecentConfirm: '确定要清除所有最近访问记录吗?',

    // 用户视图
    title: 'I CAN, We WILL',
    subtitle: '畅所欲言，提问投票',
    connected: '实时同步中',
    connecting: '连接中...',
    connectionFailed: '连接失败',
    error: '错误',
    closeError: '关闭',

    // 提问表单
    questionPlaceholder: '输入你的问题...',
    submitQuestion: '提交问题',
    submitting: '提交中...',
    waitingConnection: '等待连接...',

    // 问题列表
    allQuestions: '所有问题',
    questionsCount: '个问题',
    noQuestions: '还没有问题，快来提问吧！',
    myQuestion: '我的问题',
    reply: '回复',
    replies: '条回复',
    addReply: '添加回复',
    replyPlaceholder: '输入回复...',
    deleteQuestion: '删除此问题',
    deleteConfirm: '确定要删除这个问题吗？删除后无法恢复。',

    // 大屏视图
    displayTitle: 'CTS on AIR',
    totalQuestions: '共',
    questionUnit: '个问题',
    votes: '投票',
    adminLogin: '管理登录',
    adminMode: '管理模式',
    closeAdmin: '关闭管理',
    closeAdminShort: '关闭',
    adminShort: '管理',
    logout: '退出',
    clearAll: '清空所有问题',
    clearAllShort: '清空',
    cleanupStaleRooms: '清理闲置会议室',
    cleanupShort: '清理',
    cleaning: '清理中...',
    cleaningShort: '清理中',
    waitingQuestions: '等待问题中...',

    // 管理员
    adminVerification: '管理员验证',
    enterPassword: '请输入管理员密码',
    passwordPlaceholder: '输入密码...',
    passwordError: '密码错误！',
    cancel: '取消',
    confirm: '确认',
    adminModeEnabled: '管理模式已启用 - 鼠标悬停在问题上可删除',
    adminModeShort: '管理模式',
    needAdminPermission: '需要管理员权限',
    deleteQuestionConfirm: '确定要删除这个问题吗？',
    clearAllConfirm: '确定要清空所有问题吗？此操作不可恢复！',
    allQuestionsCleared: '已清空所有问题',
    deleteFailed: '删除失败',
    clearFailed: '清空失败',
    adminPasswordNotSet: '管理员密码未配置！请在环境变量中设置 NEXT_PUBLIC_ADMIN_PASSWORD',

    // 错误提示
    rateLimitExceeded: '操作过于频繁，请稍后再试',
    questionLimitReached: '当前会议室已达到最大问题数量限制（100个），请等待管理员清理或切换到其他会议室',
    submitFailed: '提交失败',
    permissionDenied: '权限被拒绝。请检查 Firebase 安全规则设置。',
    networkError: '网络错误，请检查网络连接。',
    firebaseNotInitialized: 'Firebase 数据库未初始化',
    questionEmpty: '问题不能为空',
    questionTooLong: '问题长度不能超过500字符',

    // 其他翻译
    loadSettingsFailed: '加载设置失败',
    saveRoomHistoryFailed: '保存会议室历史失败',
    clearHistoryFailed: '清除历史记录失败',
    clickTopLeft: '点击左上角的',
    roomButtonText: '按钮,创建或切换到其他会议室',
    enterRoomNamePlaceholder: '输入会议室名称（英文/数字）',
    clearAllHistory: '清除所有历史记录',
    switchLanguage: '切换语言',
    switchTheme: '切换主题',
    deleteThisQuestion: '删除此问题',
  },
  en: {
    // Top Navigation
    room: 'Room',
    userView: 'User View',
    displayView: 'Display View',

    // Welcome Dialog
    welcome: 'Welcome',
    welcomeFeature1: '🏠 Multi-Room Support: Create separate rooms for each meeting',
    welcomeFeature2: '💬 Real-time Interaction: Questions, votes, and replies sync instantly',
    welcomeFeature3: '📺 Display Mode: Show trending questions on meeting room screen',
    welcomeTip: '💡 Quick Start:',
    welcomeHint: 'Click the top-left',
    welcomeButtonText: 'button to create or switch rooms',
    startUsing: 'Get Started',

    // Room Management
    roomManagement: 'Room Management',
    currentRoom: 'Current',
    currentRoomLabel: 'Current Room',
    copyLink: 'Copy Link',
    copied: 'Copied',
    createNewRoom: 'Create New Room',
    enterRoomName: 'Enter room name (letters/numbers)',
    create: 'Create',
    roomNameRule: 'Room names can only contain letters, numbers, underscores and hyphens',
    quickAccess: 'Quick Access',
    defaultRoom: 'Default Room',
    defaultRoomDesc: 'CTS-MR25 Public Q&A',
    recentVisit: 'Recent Visits',
    clear: 'Clear',
    clearRecentConfirm: 'Are you sure you want to clear all recent visit records?',

    // User View
    title: 'I CAN, We WILL',
    subtitle: 'Ask Anything, Vote Together',
    connected: 'Real-time Synced',
    connecting: 'Connecting...',
    connectionFailed: 'Connection Failed',
    error: 'Error',
    closeError: 'Close',

    // Question Form
    questionPlaceholder: 'Enter your question...',
    submitQuestion: 'Submit Question',
    submitting: 'Submitting...',
    waitingConnection: 'Waiting for connection...',

    // Question List
    allQuestions: 'All Questions',
    questionsCount: 'questions',
    noQuestions: 'No questions yet, be the first to ask!',
    myQuestion: 'My Question',
    reply: 'Reply',
    replies: 'replies',
    addReply: 'Add Reply',
    replyPlaceholder: 'Enter your reply...',
    deleteQuestion: 'Delete this question',
    deleteConfirm: 'Are you sure you want to delete this question? This action cannot be undone.',

    // Display View
    displayTitle: 'CTS on AIR',
    totalQuestions: 'Total',
    questionUnit: 'questions',
    votes: 'Votes',
    adminLogin: 'Admin Login',
    adminMode: 'Admin Mode',
    closeAdmin: 'Close Admin',
    closeAdminShort: 'Close',
    adminShort: 'Admin',
    logout: 'Logout',
    clearAll: 'Clear All Questions',
    clearAllShort: 'Clear',
    cleanupStaleRooms: 'Cleanup Stale Rooms',
    cleanupShort: 'Cleanup',
    cleaning: 'Cleaning...',
    cleaningShort: 'Cleaning',
    waitingQuestions: 'Waiting for questions...',

    // Admin
    adminVerification: 'Admin Verification',
    enterPassword: 'Please enter admin password',
    passwordPlaceholder: 'Enter password...',
    passwordError: 'Incorrect password!',
    cancel: 'Cancel',
    confirm: 'Confirm',
    adminModeEnabled: 'Admin mode enabled - Hover over questions to delete',
    adminModeShort: 'Admin Mode',
    needAdminPermission: 'Admin permission required',
    deleteQuestionConfirm: 'Are you sure you want to delete this question?',
    clearAllConfirm: 'Are you sure you want to clear all questions? This action cannot be undone!',
    allQuestionsCleared: 'All questions cleared',
    deleteFailed: 'Delete failed',
    clearFailed: 'Clear failed',
    adminPasswordNotSet: 'Admin password not configured! Please set NEXT_PUBLIC_ADMIN_PASSWORD in environment variables',

    // Error Messages
    rateLimitExceeded: 'Too many actions, please try again later',
    questionLimitReached: 'Room has reached the maximum limit of 100 questions. Please wait for admin cleanup or switch to another room',
    submitFailed: 'Submit failed',
    permissionDenied: 'Permission denied. Please check Firebase security rules.',
    networkError: 'Network error, please check your connection.',
    firebaseNotInitialized: 'Firebase database not initialized',
    questionEmpty: 'Question cannot be empty',
    questionTooLong: 'Question cannot exceed 500 characters',

    // Other translations
    loadSettingsFailed: 'Failed to load settings',
    saveRoomHistoryFailed: 'Failed to save room history',
    clearHistoryFailed: 'Failed to clear history',
    clickTopLeft: 'Click the top-left',
    roomButtonText: 'button to create or switch rooms',
    enterRoomNamePlaceholder: 'Enter room name (letters/numbers)',
    clearAllHistory: 'Clear all history',
    switchLanguage: 'Switch Language',
    switchTheme: 'Switch Theme',
    deleteThisQuestion: 'Delete this question',
  }
};

// 获取翻译文本
export const t = (key, lang = 'zh') => {
  return translations[lang]?.[key] || translations.zh[key] || key;
};
