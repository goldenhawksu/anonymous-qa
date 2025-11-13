/**
 * 会议室清理工具
 * 用于清理闲置30天以上的"孤儿"会议室
 *
 * 使用方法：
 * 1. 在页面中添加管理员按钮触发清理
 * 2. 或在Node.js环境中直接运行（需要Firebase Admin SDK）
 */

import { database } from './firebase';
import { ref, onValue, remove, get } from 'firebase/database';

/**
 * 检查会议室是否为"孤儿"（闲置10天以上）
 * @param {Object} roomData - 会议室数据
 * @returns {boolean} - 是否应该删除
 */
export function isStaleRoom(roomData) {
  if (!roomData || !roomData.questions) {
    return false; // 空会议室暂不删除
  }

  const now = Date.now();
  const thirtyDaysMs = 10 * 24 * 60 * 60 * 1000; // 10天的毫秒数

  // 找到最新的活动时间
  let latestActivity = 0;

  Object.values(roomData.questions || {}).forEach(question => {
    if (question.timestamp > latestActivity) {
      latestActivity = question.timestamp;
    }

    // 检查回复的时间
    if (question.replies) {
      Object.values(question.replies).forEach(reply => {
        if (reply.timestamp > latestActivity) {
          latestActivity = reply.timestamp;
        }
      });
    }
  });

  // 如果最后活动时间超过30天，标记为可删除
  return latestActivity > 0 && (now - latestActivity) > thirtyDaysMs;
}

/**
 * 扫描并返回所有闲置会议室的列表
 * @returns {Promise<Array>} - 闲置会议室列表
 */
export async function scanStaleRooms() {
  try {
    const roomsRef = ref(database, 'rooms');
    const snapshot = await get(roomsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const rooms = snapshot.val();
    const staleRooms = [];

    Object.entries(rooms).forEach(([roomId, roomData]) => {
      if (isStaleRoom(roomData)) {
        // 计算闲置天数
        let latestActivity = 0;
        Object.values(roomData.questions || {}).forEach(question => {
          if (question.timestamp > latestActivity) {
            latestActivity = question.timestamp;
          }
          if (question.replies) {
            Object.values(question.replies).forEach(reply => {
              if (reply.timestamp > latestActivity) {
                latestActivity = reply.timestamp;
              }
            });
          }
        });

        const daysIdle = Math.floor((Date.now() - latestActivity) / (24 * 60 * 60 * 1000));
        const questionCount = Object.keys(roomData.questions || {}).length;

        staleRooms.push({
          roomId,
          daysIdle,
          questionCount,
          lastActivity: new Date(latestActivity).toLocaleString('zh-CN')
        });
      }
    });

    return staleRooms;
  } catch (error) {
    console.error('❌ 扫描闲置会议室失败:', error);
    throw error;
  }
}

/**
 * 删除指定的会议室
 * @param {string} roomId - 会议室ID
 * @returns {Promise<void>}
 */
export async function deleteRoom(roomId) {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    await remove(roomRef);
    console.log(`✅ 成功删除会议室: ${roomId}`);
  } catch (error) {
    console.error(`❌ 删除会议室失败 (${roomId}):`, error);
    throw error;
  }
}

/**
 * 批量清理闲置会议室
 * @param {boolean} dryRun - 是否仅模拟运行（不实际删除）
 * @returns {Promise<Object>} - 清理结果
 */
export async function cleanupStaleRooms(dryRun = true) {
  console.log('🔍 开始扫描闲置会议室...');

  try {
    const staleRooms = await scanStaleRooms();

    if (staleRooms.length === 0) {
      console.log('✅ 没有发现闲置会议室');
      return {
        success: true,
        scanned: 0,
        found: 0,
        deleted: 0,
        rooms: []
      };
    }

    console.log(`📊 发现 ${staleRooms.length} 个闲置会议室:`);
    staleRooms.forEach(room => {
      console.log(`  - ${room.roomId}: 闲置${room.daysIdle}天, ${room.questionCount}个问题, 最后活动: ${room.lastActivity}`);
    });

    if (dryRun) {
      console.log('ℹ️  模拟模式：未实际删除数据');
      return {
        success: true,
        scanned: staleRooms.length,
        found: staleRooms.length,
        deleted: 0,
        rooms: staleRooms,
        dryRun: true
      };
    }

    // 实际删除
    console.log('🗑️  开始删除闲置会议室...');
    let deletedCount = 0;
    const errors = [];

    for (const room of staleRooms) {
      try {
        await deleteRoom(room.roomId);
        deletedCount++;
      } catch (error) {
        errors.push({ roomId: room.roomId, error: error.message });
      }
    }

    console.log(`✅ 清理完成: 删除 ${deletedCount}/${staleRooms.length} 个会议室`);

    if (errors.length > 0) {
      console.warn('⚠️  部分删除失败:', errors);
    }

    return {
      success: true,
      scanned: staleRooms.length,
      found: staleRooms.length,
      deleted: deletedCount,
      rooms: staleRooms,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('❌ 清理失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 格式化清理结果为可读文本
 * @param {Object} result - 清理结果
 * @returns {string} - 格式化后的文本
 */
export function formatCleanupResult(result) {
  if (!result.success) {
    return `清理失败: ${result.error}`;
  }

  let text = `扫描结果:\n`;
  text += `- 发现 ${result.found} 个闲置会议室\n`;

  if (result.dryRun) {
    text += `- 模拟模式：未实际删除\n\n`;
  } else {
    text += `- 已删除 ${result.deleted} 个会议室\n\n`;
  }

  if (result.rooms.length > 0) {
    text += `详细列表:\n`;
    result.rooms.forEach(room => {
      text += `• ${room.roomId}\n`;
      text += `  闲置: ${room.daysIdle}天 | 问题: ${room.questionCount}个\n`;
      text += `  最后活动: ${room.lastActivity}\n\n`;
    });
  }

  if (result.errors && result.errors.length > 0) {
    text += `\n错误:\n`;
    result.errors.forEach(err => {
      text += `• ${err.roomId}: ${err.error}\n`;
    });
  }

  return text;
}
