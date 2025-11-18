// 主题配置 - 白天/黑夜模式

export const themes = {
  light: {
    name: '白天模式',
    nameEn: 'Light Mode',
    icon: '☀️',
    // 背景渐变
    gradient: 'from-purple-50 via-blue-50 to-pink-50',
    // 主色调
    primary: 'from-purple-500 to-pink-500',
    primaryHover: 'from-purple-600 to-pink-600',
    // 卡片背景
    cardBg: 'bg-white',
    cardBorder: 'border-gray-100',
    // 文字颜色
    textPrimary: 'text-gray-800',
    textSecondary: 'text-gray-600',
    textTertiary: 'text-gray-400',
    // 输入框
    inputBg: 'bg-white',
    inputBorder: 'border-gray-200',
    inputFocus: 'focus:border-purple-400',
    // 按钮
    buttonHover: 'hover:bg-gray-100',
    buttonBg: 'bg-gray-100',
    // 导航栏
    navBg: 'bg-white/80',
    navBorder: 'border-gray-200',
    // 其他
    divider: 'border-gray-200',
    shadow: 'shadow-xl'
  },
  dark: {
    name: '黑夜模式',
    nameEn: 'Dark Mode',
    icon: '🌙',
    // 背景渐变
    gradient: 'from-gray-900 via-slate-900 to-zinc-900',
    // 主色调
    primary: 'from-purple-600 to-pink-600',
    primaryHover: 'from-purple-700 to-pink-700',
    // 卡片背景
    cardBg: 'bg-gray-800',
    cardBorder: 'border-gray-700',
    // 文字颜色
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textTertiary: 'text-gray-500',
    // 输入框
    inputBg: 'bg-gray-700',
    inputBorder: 'border-gray-600',
    inputFocus: 'focus:border-purple-500',
    // 按钮
    buttonHover: 'hover:bg-gray-700',
    buttonBg: 'bg-gray-700',
    // 导航栏
    navBg: 'bg-gray-800/80',
    navBorder: 'border-gray-700',
    // 其他
    divider: 'border-gray-700',
    shadow: 'shadow-2xl'
  }
};

export const getThemeList = () => Object.keys(themes);
export const getTheme = (themeName) => themes[themeName] || themes.light;
