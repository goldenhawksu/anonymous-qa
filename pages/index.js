
// pages/index.js
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, TrendingUp, Users, Monitor } from 'lucide-react';

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

  useEffect(() => {
    // 初始化数据
    const stored = localStorage.getItem('questions');
    if (stored) {
      setQuestions(JSON.parse(stored));
    }

    // 监听storage变化实现实时更新
    const handleStorage = () => {
      const stored = localStorage.getItem('questions');
      if (stored) {
        setQuestions(JSON.parse(stored));
      }
    };

    window.addEventListener('storage', handleStorage);
    // 使用定时器模拟实时更新（同一页面storage事件不触发）
    const interval = setInterval(() => {
      const stored = localStorage.getItem('questions');
      if (stored) {
        setQuestions(JSON.parse(stored));
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setIsSubmitting(true);
    
    const question = {
      id: Date.now(),
      text: newQuestion.trim(),
      votes: 0,
      timestamp: new Date().toISOString(),
      votedBy: []
    };

    const updated = [question, ...questions];
    setQuestions(updated);
    localStorage.setItem('questions', JSON.stringify(updated));
    
    setTimeout(() => {
      setNewQuestion('');
      setIsSubmitting(false);
    }, 500);
  };

  const handleVote = (id) => {
    const deviceId = getDeviceId();
    const updated = questions.map(q => {
      if (q.id === id) {
        const hasVoted = q.votedBy?.includes(deviceId);
        return {
          ...q,
          votes: hasVoted ? q.votes - 1 : q.votes + 1,
          votedBy: hasVoted 
            ? q.votedBy.filter(v => v !== deviceId)
            : [...(q.votedBy || []), deviceId]
        };
      }
      return q;
    });
    
    setQuestions(updated);
    localStorage.setItem('questions', JSON.stringify(updated));
  };

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  const hasVoted = (question) => {
    const deviceId = getDeviceId();
    return question.votedBy?.includes(deviceId);
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
      </motion.div>

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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none text-gray-800 placeholder-gray-400"
            rows="4"
          />
          <button
            type="submit"
            disabled={!newQuestion.trim() || isSubmitting}
            className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '提交中...' : '提交问题'}
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
                  <span className="text-lg font-bold">{question.votes}</span>
                </button>
                
                <div className="flex-1">
                  <p className="text-gray-800 text-lg leading-relaxed">{question.text}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(question.timestamp).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {questions.length === 0 && (
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

  useEffect(() => {
    const updateQuestions = () => {
      const stored = localStorage.getItem('questions');
      if (stored) {
        setQuestions(JSON.parse(stored));
      }
    };

    updateQuestions();
    const interval = setInterval(updateQuestions, 1000);

    return () => clearInterval(interval);
  }, []);

  const topQuestions = [...questions]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 10);

  return (
    <div className="min-h-screen p-8">
      {/* 大屏头部 */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
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
              className="relative"
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
                  <span className="text-4xl font-bold">{question.votes}</span>
                  <span className="text-sm opacity-90">同问</span>
                </div>
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
