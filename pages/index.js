
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, TrendingUp, Users, Monitor, Trash2, AlertCircle, Lock, LogOut, MessageCircle, Send, DoorOpen, X, Plus, Home as HomeIcon, Clock, Copy, Check } from 'lucide-react';
import { database } from '../lib/firebase';
import { ref, push, onValue, set, update, remove } from 'firebase/database';
import { rateLimiters } from '../lib/rateLimit';
import { cleanupStaleRooms, formatCleanupResult } from '../lib/roomCleanup';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState('user'); // 'user' or 'display'
  const [roomId, setRoomId] = useState('CTS-MR25');
  const [showRoomManager, setShowRoomManager] = useState(false);
  const [newRoomInput, setNewRoomInput] = useState('');
  const [recentRooms, setRecentRooms] = useState([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [copied, setCopied] = useState(false);

  // 从 URL 获取房间 ID
  useEffect(() => {
    if (router.isReady) {
      const { room } = router.query;
      if (room && typeof room === 'string') {
        // 验证房间 ID 格式（只允许字母、数字、下划线、连字符）
        const sanitizedRoom = room.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50);
        setRoomId(sanitizedRoom || 'CTS-MR25');

        // 添加到最近访问
        addToRecentRooms(sanitizedRoom || 'CTS-MR25');
      } else {
        setRoomId('CTS-MR25');
      }
    }
  }, [router.isReady, router.query]);

  // 加载最近访问的房间
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentRooms');
      if (saved) {
        setRecentRooms(JSON.parse(saved));
      }

      // 检查是否首次访问
      const hasVisited = localStorage.getItem('hasVisited');
      if (!hasVisited) {
        setShowWelcome(true);
        localStorage.setItem('hasVisited', 'true');
      }
    } catch (error) {
      console.error('加载会议室历史失败:', error);
    }
  }, []);

  // 添加到最近访问
  const addToRecentRooms = (room) => {
    try {
      const saved = localStorage.getItem('recentRooms');
      let rooms = saved ? JSON.parse(saved) : [];

      // 移除重复
      rooms = rooms.filter(r => r !== room);

      // 添加到开头
      rooms.unshift(room);

      // 只保留最近10个
      rooms = rooms.slice(0, 10);

      localStorage.setItem('recentRooms', JSON.stringify(rooms));
      setRecentRooms(rooms);
    } catch (error) {
      console.error('保存会议室历史失败:', error);
    }
  };

  // 切换到房间
  const switchToRoom = (room) => {
    router.push(`/?room=${room}`);
    setShowRoomManager(false);
  };

  // 创建新房间
  const createNewRoom = () => {
    if (!newRoomInput.trim()) return;

    // 🔒 速率限制检查
    const rateLimitCheck = rateLimiters.roomCreate.canPerformAction('createRoom');
    if (!rateLimitCheck.allowed) {
      alert(rateLimitCheck.message);
      return;
    }

    const sanitized = newRoomInput.trim().replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50);
    if (sanitized) {
      switchToRoom(sanitized);
      setNewRoomInput('');
    }
  };

  // 复制房间链接
  const copyRoomLink = () => {
    const url = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 清除最近访问记录
  const clearRecentRooms = () => {
    if (confirm('确定要清除所有最近访问记录吗?')) {
      try {
        localStorage.removeItem('recentRooms');
        setRecentRooms([]);
      } catch (error) {
        console.error('清除历史记录失败:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* 欢迎引导弹窗 */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-lg w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <DoorOpen className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">欢迎使用</h2>
              <div className="text-left space-y-3 mb-6">
                <p className="text-gray-600">
                  <strong>🏠 多会议室支持：</strong>为每个会议创建独立房间
                </p>
                <p className="text-gray-600">
                  <strong>💬 实时互动：</strong>提问、投票、回复操作实时同步
                </p>
                <p className="text-gray-600">
                  <strong>📺 大屏展示：</strong>会议室大屏显示热门问题
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-purple-800 font-medium mb-2">💡 快速开始：</p>
                <p className="text-sm text-purple-700">
                  点击左上角的 <strong>"会议室: CTS-MR25"</strong> 按钮,创建或切换到其他会议室
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                开始使用
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 房间管理器弹窗 */}
      {showRoomManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">会议室管理</h2>
                  <p className="text-xs text-gray-500">当前: {roomId}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRoomManager(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 当前房间信息 */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-purple-600 font-medium mb-1">当前会议室</p>
                  <p className="text-lg font-bold text-purple-900">{roomId}</p>
                </div>
                <button
                  onClick={copyRoomLink}
                  className="px-3 py-2 bg-white rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2 text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-purple-600" />
                      <span className="text-purple-600">复制链接</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 创建新房间 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                创建新会议室
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRoomInput}
                  onChange={(e) => setNewRoomInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createNewRoom()}
                  placeholder="输入会议室名称（英文/数字）"
                  maxLength={50}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm"
                />
                <button
                  onClick={createNewRoom}
                  disabled={!newRoomInput.trim()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  创建
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                会议室名只能包含字母、数字、下划线和连字符
              </p>
            </div>

            {/* 快捷房间 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <HomeIcon className="w-4 h-4" />
                快捷访问
              </h3>
              <button
                onClick={() => switchToRoom('CTS-MR25')}
                className={`w-full px-4 py-3 rounded-lg transition-all text-left ${
                  roomId === 'CTS-MR25'
                    ? 'bg-purple-100 border-2 border-purple-300'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                      <HomeIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">默认会议室</p>
                      <p className="text-xs text-gray-500">CTS-MR25 公共问答区</p>
                    </div>
                  </div>
                  {roomId === 'CTS-MR25' && (
                    <span className="text-xs text-purple-600 font-medium">当前</span>
                  )}
                </div>
              </button>
            </div>

            {/* 最近访问 */}
            {recentRooms.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    最近访问
                  </h3>
                  <button
                    onClick={clearRecentRooms}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                    title="清除所有历史记录"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>清除</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {recentRooms.map((room) => (
                    <button
                      key={room}
                      onClick={() => switchToRoom(room)}
                      className={`w-full px-4 py-3 rounded-lg transition-all text-left ${
                        roomId === room
                          ? 'bg-purple-100 border-2 border-purple-300'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                            <DoorOpen className="w-4 h-4 text-white" />
                          </div>
                          <p className="font-medium text-gray-800">{room}</p>
                        </div>
                        {roomId === room && (
                          <span className="text-xs text-purple-600 font-medium">当前</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* 左侧：房间按钮 */}
          <button
            onClick={() => setShowRoomManager(true)}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all"
          >
            <DoorOpen className="w-4 h-4" />
            <span className="font-medium text-sm sm:text-base max-w-[120px] sm:max-w-none truncate">
              <span className="hidden sm:inline">会议室: </span>{roomId}
            </span>
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          {/* 右侧：视图切换 */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('user')}
              className={`px-3 sm:px-4 py-2 rounded-full font-medium transition-all text-sm ${
                view === 'user'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Users className="inline-block w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">用户视图</span>
            </button>
            <button
              onClick={() => setView('display')}
              className={`px-3 sm:px-4 py-2 rounded-full font-medium transition-all text-sm ${
                view === 'display'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Monitor className="inline-block w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">大屏视图</span>
            </button>
          </div>
        </div>
      </div>

      {view === 'user' ? <UserView roomId={roomId} /> : <DisplayView roomId={roomId} />}
    </div>
  );
}

// 用户提问界面（手机端）
function UserView({ roomId }) {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [replyingTo, setReplyingTo] = useState(null); // 正在回复的问题 ID
  const [replyText, setReplyText] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({}); // 展开的问题

  // 获取或创建设备 ID
  useEffect(() => {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('deviceId', id);
    }
    setDeviceId(id);
  }, []);

  // 实时监听问题列表
  useEffect(() => {
    if (!database) {
      setConnectionStatus('error');
      setError('Firebase 未正确初始化');
      return;
    }

    const questionsRef = ref(database, `rooms/${roomId}/questions`);

    const unsubscribe = onValue(questionsRef,
      (snapshot) => {
        setConnectionStatus('connected');
        setError('');
        const data = snapshot.val();
        if (data) {
          const questionsList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setQuestions(questionsList);
        } else {
          setQuestions([]);
        }
      },
      (error) => {
        console.error('❌ Firebase 读取错误:', error);
        setConnectionStatus('error');
        setError(`读取失败: ${error.message}`);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || isSubmitting) return;

    // 🔒 速率限制检查
    const rateLimitCheck = rateLimiters.questionSubmit.canPerformAction('submitQuestion');
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.message);
      return;
    }

    // 🔒 会议室问题数量限制检查（100个上限）
    if (questions.length >= 100) {
      setError('当前会议室已达到最大问题数量限制（100个），请等待管理员清理或切换到其他会议室');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (!database) {
        throw new Error('Firebase 数据库未初始化');
      }

      const questionText = newQuestion.trim();

      // 验证文本长度
      if (questionText.length === 0) {
        throw new Error('问题不能为空');
      }
      if (questionText.length > 500) {
        throw new Error('问题长度不能超过500字符');
      }

      const questionsRef = ref(database, `rooms/${roomId}/questions`);
      const newQuestionRef = push(questionsRef);

      // 确保数据格式完全匹配规则要求
      const questionData = {
        text: questionText,
        votes: 0,
        timestamp: Date.now(),
        votedBy: {},
        replies: {}
      };

      console.log('📤 正在提交问题到会议室:', roomId);

      await set(newQuestionRef, questionData);

      console.log('✅ 问题提交成功');
      setNewQuestion('');
      setError('');
    } catch (error) {
      console.error('❌ 提交失败:', error);

      let errorMessage = '提交失败: ';

      if (error.code === 'PERMISSION_DENIED') {
        errorMessage += '权限被拒绝。请检查 Firebase 安全规则设置。';
      } else if (error.message.includes('network')) {
        errorMessage += '网络错误，请检查网络连接。';
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (questionId) => {
    if (!replyText.trim()) return;

    // 🔒 速率限制检查
    const rateLimitCheck = rateLimiters.reply.canPerformAction('reply');
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.message);
      return;
    }

    try {
      const repliesRef = ref(database, `rooms/${roomId}/questions/${questionId}/replies`);
      const newReplyRef = push(repliesRef);

      const replyData = {
        text: replyText.trim(),
        timestamp: Date.now(),
        deviceId: deviceId.substring(0, 12) + '...' // 匿名化
      };

      await set(newReplyRef, replyData);

      setReplyText('');
      setReplyingTo(null);
      console.log('✅ 回复提交成功');
    } catch (error) {
      console.error('❌ 回复失败:', error);
      setError(`回复失败: ${error.message}`);
    }
  };

  const handleVote = async (questionId) => {
    if (!deviceId) return;

    // 🔒 速率限制检查
    const rateLimitCheck = rateLimiters.vote.canPerformAction('vote');
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.message);
      setTimeout(() => setError(''), 2000); // 2秒后清除错误
      return;
    }

    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const hasVoted = question.votedBy && question.votedBy[deviceId];
      const questionRef = ref(database, `rooms/${roomId}/questions/${questionId}`);

      const newVotes = hasVoted ? Math.max(0, question.votes - 1) : question.votes + 1;

      if (hasVoted) {
        const updates = {
          votes: newVotes
        };
        updates[`votedBy/${deviceId}`] = null;
        await update(questionRef, updates);
      } else {
        const updates = {
          votes: newVotes,
          [`votedBy/${deviceId}`]: true
        };
        await update(questionRef, updates);
      }
    } catch (error) {
      console.error('❌ 投票失败:', error);
      setError(`投票失败: ${error.message}`);
    }
  };

  const hasVoted = (question) => {
    return question.votedBy && question.votedBy[deviceId];
  };

  const toggleExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const sortedQuestions = [...questions].sort((a, b) => b.votes - a.votes);

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 pt-24">
      {/* 头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 sm:py-8"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
          <MessageSquarePlus className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">I CAN, We WILL</h1>
        <p className="text-sm sm:text-base text-gray-600">畅所欲言，同问支持</p>

        {/* 连接状态 */}
        <div className="mt-2">
          {connectionStatus === 'connected' && (
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              实时同步中
            </div>
          )}
          {connectionStatus === 'connecting' && (
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-xs sm:text-sm">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              连接中...
            </div>
          )}
          {connectionStatus === 'error' && (
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4" />
              连接失败
            </div>
          )}
        </div>
      </motion.div>

      {/* 错误提示 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium mb-1 text-sm sm:text-base">错误</p>
              <p className="text-red-600 text-xs sm:text-sm">{error}</p>
              <button
                onClick={() => setError('')}
                className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
              >
                关闭
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 提问表单 */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="mb-6 sm:mb-8"
      >
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-purple-100">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="输入你的问题..."
            maxLength={500}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none text-gray-800 placeholder-gray-400 text-sm sm:text-base"
            rows="4"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {newQuestion.length}/500
            </span>
          </div>
          <button
            type="submit"
            disabled={!newQuestion.trim() || isSubmitting || connectionStatus !== 'connected'}
            className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 sm:py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isSubmitting ? '提交中...' :
             connectionStatus !== 'connected' ? '等待连接...' :
             '提交问题'}
          </button>
        </div>
      </motion.form>

      {/* 问题列表 */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">所有问题</h2>
          <span className="text-xs sm:text-sm text-gray-500">{questions.length} 个问题</span>
        </div>

        <AnimatePresence>
          {sortedQuestions.map((question, index) => {
            const repliesArray = question.replies ? Object.keys(question.replies).map(key => ({
              id: key,
              ...question.replies[key]
            })).sort((a, b) => a.timestamp - b.timestamp) : [];
            const replyCount = repliesArray.length;
            const isExpanded = expandedQuestions[question.id];

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-gray-100 hover:border-purple-200 transition-all"
              >
                <div className="flex gap-3 sm:gap-4">
                  <button
                    onClick={() => handleVote(question.id)}
                    className={`flex flex-col items-center justify-center min-w-14 h-14 sm:min-w-16 sm:h-16 rounded-xl transition-all ${
                      hasVoted(question)
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                    <span className="text-base sm:text-lg font-bold">{question.votes || 0}</span>
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-base sm:text-lg leading-relaxed break-words">{question.text}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-gray-400">
                        {new Date(question.timestamp).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>

                      {/* 回复按钮 */}
                      <button
                        onClick={() => toggleExpand(question.id)}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        {replyCount > 0 ? `${replyCount} 条回复` : '回复'}
                      </button>
                    </div>

                    {/* 回复区域 */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3"
                      >
                        {/* 显示所有回复 */}
                        {repliesArray.map((reply) => (
                          <div key={reply.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                            <p className="text-sm text-gray-700">{reply.text}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(reply.timestamp).toLocaleString('zh-CN', {
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        ))}

                        {/* 回复输入框 */}
                        {replyingTo === question.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="输入回复..."
                              maxLength={200}
                              className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => handleReplySubmit(question.id)}
                              disabled={!replyText.trim()}
                              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingTo(question.id)}
                            className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                          >
                            <MessageCircle className="w-4 h-4" />
                            添加回复
                          </button>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {questions.length === 0 && connectionStatus === 'connected' && (
          <div className="text-center py-12 text-gray-400">
            <MessageSquarePlus className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-base">还没有问题，快来提问吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 大屏展示界面（带密码保护）
function DisplayView({ roomId }) {
  const [questions, setQuestions] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isCleaningRooms, setIsCleaningRooms] = useState(false);

  // 从环境变量获取管理员密码
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  // 实时监听问题列表
  useEffect(() => {
    if (!database) {
      console.error('Firebase 未初始化');
      return;
    }

    const questionsRef = ref(database, `rooms/${roomId}/questions`);

    const unsubscribe = onValue(questionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const questionsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setQuestions(questionsList);
      } else {
        setQuestions([]);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  // 检查管理员密码是否已配置
  useEffect(() => {
    if (!ADMIN_PASSWORD) {
      console.warn('⚠️ NEXT_PUBLIC_ADMIN_PASSWORD 未设置！管理功能将被禁用。');
    }
  }, [ADMIN_PASSWORD]);

  const handleAdminClick = () => {
    if (!ADMIN_PASSWORD) {
      alert('管理员密码未配置！请在环境变量中设置 NEXT_PUBLIC_ADMIN_PASSWORD');
      return;
    }

    if (!isAuthenticated) {
      setShowPasswordDialog(true);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setShowAdmin(!showAdmin);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowAdmin(true);
      setShowPasswordDialog(false);
      setPasswordInput('');
      setPasswordError('');

      // 在 sessionStorage 中保存认证状态（刷新页面后失效，更安全）
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      setPasswordError('密码错误！');
      setPasswordInput('');
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordDialog(false);
    setPasswordInput('');
    setPasswordError('');
  };

  // 页面加载时检查 session 中的认证状态
  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleDelete = async (questionId) => {
    if (!isAuthenticated) {
      alert('需要管理员权限');
      return;
    }

    if (confirm('确定要删除这个问题吗？')) {
      try {
        const questionRef = ref(database, `rooms/${roomId}/questions/${questionId}`);
        await remove(questionRef);
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败: ' + error.message);
      }
    }
  };

  const handleClearAll = async () => {
    if (!isAuthenticated) {
      alert('需要管理员权限');
      return;
    }

    if (confirm('确定要清空所有问题吗？此操作不可恢复！')) {
      try {
        const questionsRef = ref(database, `rooms/${roomId}/questions`);
        await set(questionsRef, null);
        alert('已清空所有问题');
        setShowAdmin(false);
      } catch (error) {
        console.error('清空失败:', error);
        alert('清空失败: ' + error.message);
      }
    }
  };

  // 清理闲置会议室
  const handleCleanupStaleRooms = async () => {
    if (!isAuthenticated) {
      alert('需要管理员权限');
      return;
    }

    setIsCleaningRooms(true);

    try {
      // 先进行模拟运行，展示将要删除的会议室
      const dryRunResult = await cleanupStaleRooms(true);

      if (!dryRunResult.success) {
        alert(`扫描失败: ${dryRunResult.error}`);
        setIsCleaningRooms(false);
        return;
      }

      if (dryRunResult.found === 0) {
        alert('✅ 没有发现闲置30天以上的会议室');
        setIsCleaningRooms(false);
        return;
      }

      // 显示扫描结果并请求确认
      const resultText = formatCleanupResult(dryRunResult);
      const confirmed = confirm(
        `${resultText}\n确定要删除这些闲置会议室吗？\n此操作不可恢复！`
      );

      if (!confirmed) {
        setIsCleaningRooms(false);
        return;
      }

      // 执行实际删除
      const cleanupResult = await cleanupStaleRooms(false);

      if (cleanupResult.success) {
        const finalText = formatCleanupResult(cleanupResult);
        alert(`✅ 清理完成\n\n${finalText}`);
      } else {
        alert(`❌ 清理失败: ${cleanupResult.error}`);
      }
    } catch (error) {
      console.error('清理闲置会议室失败:', error);
      alert(`清理失败: ${error.message}`);
    } finally {
      setIsCleaningRooms(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowAdmin(false);
    sessionStorage.removeItem('adminAuth');
  };

  const topQuestions = [...questions]
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, 10);

  return (
    <div className="min-h-screen p-4 sm:p-8 pt-32 sm:pt-24">
      {/* 密码输入对话框 */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">管理员验证</h2>
                <p className="text-xs sm:text-sm text-gray-600">请输入管理员密码</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="输入密码..."
                autoFocus
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base"
              />

              {passwordError && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancelPassword}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all text-sm sm:text-base"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!passwordInput}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  确认
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 管理员工具栏 */}
      <div className="fixed top-20 sm:top-20 left-4 z-40 max-w-[calc(100vw-2rem)]">
        {!isAuthenticated ? (
          <button
            onClick={handleAdminClick}
            className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-all shadow-lg flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">管理登录</span>
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleAdminClick}
                className={`px-3 sm:px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 shadow-lg ${
                  showAdmin
                    ? 'bg-red-600 text-white'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{showAdmin ? '关闭管理' : '管理模式'}</span>
                <span className="sm:hidden">{showAdmin ? '关闭' : '管理'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-full text-sm hover:bg-gray-600 transition-all shadow-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">退出</span>
              </button>
            </div>

            {/* 清空所有按钮 */}
            {showAdmin && (
              <>
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleClearAll}
                  className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-all shadow-lg flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">清空所有问题</span>
                  <span className="sm:hidden">清空</span>
                </motion.button>

                {/* 清理闲置会议室按钮 */}
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleCleanupStaleRooms}
                  disabled={isCleaningRooms}
                  className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-full text-sm hover:bg-purple-600 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isCleaningRooms ? '清理中...' : '清理闲置会议室'}
                  </span>
                  <span className="sm:hidden">
                    {isCleaningRooms ? '清理中' : '清理'}
                  </span>
                </motion.button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 大屏头部 */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12"
      >
        <div className="inline-flex items-center gap-3 sm:gap-4 bg-white/80 backdrop-blur-sm px-4 sm:px-8 py-3 sm:py-4 rounded-3xl shadow-2xl">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <MessageSquarePlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">CTS on AIR</h1>
            <p className="text-sm sm:text-base text-gray-600">共 {questions.length} 个问题</p>
          </div>
        </div>

        {/* 管理模式提示 */}
        {showAdmin && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 w-full"
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm mx-auto">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">管理模式已启用 - 鼠标悬停在问题上可删除</span>
              <span className="sm:hidden">管理模式</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 问题展示 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-4 sm:gap-6">
        <AnimatePresence>
          {topQuestions.map((question, index) => {
            const replyCount = question.replies ? Object.keys(question.replies).length : 0;

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="flex items-center gap-3 sm:gap-6 bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border-2 border-gray-100 hover:scale-102 transition-transform">
                  {/* 排名 */}
                  <div className={`flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl font-bold ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-lg' :
                    index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-lg' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    #{index + 1}
                  </div>

                  {/* 问题内容 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base sm:text-2xl text-gray-800 leading-relaxed font-medium break-words">
                      {question.text}
                    </p>
                    {replyCount > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-purple-600">
                        <MessageCircle className="w-4 h-4" />
                        <span>{replyCount} 条回复</span>
                      </div>
                    )}
                  </div>

                  {/* 票数 */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white px-4 py-3 sm:px-8 sm:py-6 rounded-xl sm:rounded-2xl shadow-lg">
                    <TrendingUp className="w-5 h-5 sm:w-8 sm:h-8" />
                    <span className="text-2xl sm:text-4xl font-bold">{question.votes || 0}</span>
                    <span className="text-xs sm:text-sm opacity-90">同问</span>
                  </div>

                  {/* 删除按钮 */}
                  {showAdmin && isAuthenticated && (
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-red-600 shadow-lg"
                      title="删除此问题"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {questions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 sm:py-24"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-white/80 rounded-full mb-6 shadow-xl">
              <MessageSquarePlus className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
            </div>
            <p className="text-2xl sm:text-3xl text-gray-400 font-medium">等待问题中...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
