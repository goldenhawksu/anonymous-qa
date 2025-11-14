/**
 * 速率限制器 - 基于LocalStorage的客户端限流
 * 用于防止恶意用户快速提交大量请求
 */

export class RateLimiter {
  /**
   * @param {number} maxActions - 时间窗口内允许的最大操作次数
   * @param {number} timeWindowMs - 时间窗口（毫秒）
   */
  constructor(maxActions, timeWindowMs) {
    this.maxActions = maxActions;
    this.timeWindow = timeWindowMs;
  }

  /**
   * 检查是否可以执行操作
   * @param {string} key - 操作的唯一标识符
   * @returns {{allowed: boolean, waitTime?: number, message?: string}}
   */
  canPerformAction(key) {
    const now = Date.now();
    const storageKey = `rateLimit_${key}`;

    try {
      // 从localStorage读取历史记录
      const stored = localStorage.getItem(storageKey);
      const actions = stored ? JSON.parse(stored) : [];

      // 清除过期记录
      const validActions = actions.filter(
        timestamp => now - timestamp < this.timeWindow
      );

      // 检查是否超限
      if (validActions.length >= this.maxActions) {
        const oldestAction = Math.min(...validActions);
        const waitTime = this.timeWindow - (now - oldestAction);
        return {
          allowed: false,
          waitTime: Math.ceil(waitTime / 1000),  // 转换为秒
          message: `操作过于频繁，请等待 ${Math.ceil(waitTime / 1000)} 秒`
        };
      }

      // 记录本次操作
      validActions.push(now);
      localStorage.setItem(storageKey, JSON.stringify(validActions));

      return { allowed: true };
    } catch (error) {
      console.error('速率限制检查失败:', error);
      // 失败时允许操作，避免影响正常用户
      return { allowed: true };
    }
  }

  /**
   * 重置指定key的速率限制
   * @param {string} key - 操作的唯一标识符
   */
  reset(key) {
    const storageKey = `rateLimit_${key}`;
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('重置速率限制失败:', error);
    }
  }

  /**
   * 获取当前剩余次数
   * @param {string} key - 操作的唯一标识符
   * @returns {number} 剩余可用次数
   */
  getRemainingActions(key) {
    const now = Date.now();
    const storageKey = `rateLimit_${key}`;

    try {
      const stored = localStorage.getItem(storageKey);
      const actions = stored ? JSON.parse(stored) : [];
      const validActions = actions.filter(
        timestamp => now - timestamp < this.timeWindow
      );
      return Math.max(0, this.maxActions - validActions.length);
    } catch (error) {
      console.error('获取剩余次数失败:', error);
      return this.maxActions;
    }
  }
}

/**
 * 预定义的速率限制器实例
 */
export const rateLimiters = {
  // 问题提交: 每分钟最多5个
  questionSubmit: new RateLimiter(5, 60 * 1000),

  // 会议室创建: 每小时最多3个
  roomCreate: new RateLimiter(3, 60 * 60 * 1000),

  // 投票: 每秒最多1个
  vote: new RateLimiter(1, 1000),

  // 回复: 每分钟最多10个
  reply: new RateLimiter(10, 60 * 1000),

  // 用户删除自己的问题: 每分钟最多3个
  userDelete: new RateLimiter(3, 60 * 1000),
};

/**
 * 格式化时间窗口为可读文本
 * @param {number} ms - 毫秒数
 * @returns {string} 可读文本（如 "1分钟", "1小时"）
 */
export function formatTimeWindow(ms) {
  const seconds = ms / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;

  if (hours >= 1) return `${hours}小时`;
  if (minutes >= 1) return `${minutes}分钟`;
  return `${seconds}秒`;
}
