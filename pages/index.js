
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, TrendingUp, Users, Monitor, Trash2, AlertCircle } from 'lucide-react';
import { database } from '../lib/firebase';
import { ref, push, onValue, set, update, remove } from 'firebase/database';

export default function Home() {
  const [view, setView] = useState('user'); // 'user' or 'display'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* 视图切换按钮 */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setView('user')}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            view === 'user'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Users className="inline-block w-4 h-4 mr-2" />
          用户视图
        </button>
        <button
          onClick={() => setView('display')}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            view === 'display'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Monitor className="inline-block w-4 h-4 mr-2" />
          大屏视图
        </button>
      </div>

      {view === 'user' ? <UserView /> : <DisplayView />}
    </div>
  );
}

// 用户提问界面（手机端）
function UserView() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');

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

    const questionsRef = ref(database, 'questions');
    
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || isSubmitting) return;

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

      const questionsRef = ref(database, 'questions');
      const newQuestionRef = push(questionsRef);
      
      // 确保数据格式完全匹配规则要求
      const questionData = {
        text: questionText,
        votes: 0,  // 必须是数字 0，不是字符串
        timestamp: Date.now(),  // 必须是数字时间戳
        votedBy: {}  // 必须是空对象，不是 null 或 undefined
      };

      console.log('📤 正在提交问题，数据:', questionData);
      
      await set(newQuestionRef, questionData);

      console.log('✅ 问题提交成功');
      setNewQuestion('');
      setError('');
    } catch (error) {
      console.error('❌ 提交失败，错误详情:', error);
      console.error('错误代码:', error.code);
      console.error('错误消息:', error.message);
      
      // 详细的错误信息
      let errorMessage = '提交失败: ';
      
      if (error.code === 'PERMISSION_DENIED') {
        errorMessage += '权限被拒绝。数据格式可能不符合安全规则要求。';
        console.log('💡 提示：检查 Firebase 规则是否正确设置');
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

  const handleVote = async (questionId) => {
    if (!deviceId) return;

    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const hasVoted = question.votedBy && question.votedBy[deviceId];
      const questionRef = ref(database, `questions/${questionId}`);

      // 计算新的票数
      const newVotes = hasVoted ? Math.max(0, question.votes - 1) : question.votes + 1;

      if (hasVoted) {
        // 取消投票
        const updates = {
          votes: newVotes
        };
        // 删除投票记录
        updates[`votedBy/${deviceId}`] = null;
        await update(questionRef, updates);
      } else {
        // 投票
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

  const sortedQuestions = [...questions].sort((a, b) => b.votes - a.votes);

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* 头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
          <MessageSquarePlus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">匿名提问</h1>
        <p className="text-gray-600">畅所欲言，同问支持</p>
        
        {/* 连接状态 */}
        <div className="mt-2">
          {connectionStatus === 'connected' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              实时同步中
            </div>
          )}
          {connectionStatus === 'connecting' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              连接中...
            </div>
          )}
          {connectionStatus === 'error' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm">
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
          className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium mb-1">错误</p>
              <p className="text-red-600 text-sm">{error}</p>
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
        className="mb-8"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="输入你的问题..."
            maxLength={500}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none text-gray-800 placeholder-gray-400"
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
            className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '提交中...' : 
             connectionStatus !== 'connected' ? '等待连接...' : 
             '提交问题'}
          </button>
        </div>
      </motion.form>

      {/* 问题列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">所有问题</h2>
          <span className="text-sm text-gray-500">{questions.length} 个问题</span>
        </div>

        <AnimatePresence>
          {sortedQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-purple-200 transition-all"
            >
              <div className="flex gap-4">
                <button
                  onClick={() => handleVote(question.id)}
                  className={`flex flex-col items-center justify-center min-w-16 h-16 rounded-xl transition-all ${
                    hasVoted(question)
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp className="w-5 h-5 mb-1" />
                  <span className="text-lg font-bold">{question.votes || 0}</span>
                </button>
                
                <div className="flex-1">
                  <p className="text-gray-800 text-lg leading-relaxed">{question.text}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(question.timestamp).toLocaleString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {questions.length === 0 && connectionStatus === 'connected' && (
          <div className="text-center py-12 text-gray-400">
            <MessageSquarePlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>还没有问题，快来提问吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 大屏展示界面
function DisplayView() {
  const [questions, setQuestions] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);

  // 实时监听问题列表
  useEffect(() => {
    if (!database) {
      console.error('Firebase 未初始化');
      return;
    }

    const questionsRef = ref(database, 'questions');
    
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
  }, []);

  const handleDelete = async (questionId) => {
    if (confirm('确定要删除这个问题吗？')) {
      try {
        const questionRef = ref(database, `questions/${questionId}`);
        await remove(questionRef);
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败: ' + error.message);
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('确定要清空所有问题吗？此操作不可恢复！')) {
      try {
        const questionsRef = ref(database, 'questions');
        await set(questionsRef, null);
      } catch (error) {
        console.error('清空失败:', error);
        alert('清空失败: ' + error.message);
      }
    }
  };

  const topQuestions = [...questions]
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, 10);

  return (
    <div className="min-h-screen p-8">
      {/* 大屏头部 */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative"
      >
        <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-3xl shadow-2xl">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <MessageSquarePlus className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-gray-800">实时问答墙</h1>
            <p className="text-gray-600">共 {questions.length} 个问题</p>
          </div>
        </div>

        {/* 管理员按钮 */}
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="absolute right-0 top-0 px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-all"
        >
          <Trash2 className="inline-block w-4 h-4 mr-1" />
          管理
        </button>

        {showAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-12 bg-white rounded-xl shadow-xl p-4 border-2 border-red-100"
          >
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
            >
              清空所有问题
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* 问题展示 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6">
        <AnimatePresence>
          {topQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="flex items-center gap-6 bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gray-100 hover:scale-102 transition-transform">
                {/* 排名 */}
                <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-lg' :
                  index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-lg' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  #{index + 1}
                </div>

                {/* 问题内容 */}
                <div className="flex-1">
                  <p className="text-2xl text-gray-800 leading-relaxed font-medium">
                    {question.text}
                  </p>
                </div>

                {/* 票数 */}
                <div className="flex flex-col items-center gap-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white px-8 py-6 rounded-2xl shadow-lg">
                  <TrendingUp className="w-8 h-8" />
                  <span className="text-4xl font-bold">{question.votes || 0}</span>
                  <span className="text-sm opacity-90">同问</span>
                </div>

                {/* 删除按钮（hover 显示） */}
                {showAdmin && (
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {questions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white/80 rounded-full mb-6 shadow-xl">
              <MessageSquarePlus className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-3xl text-gray-400 font-medium">等待问题中...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
