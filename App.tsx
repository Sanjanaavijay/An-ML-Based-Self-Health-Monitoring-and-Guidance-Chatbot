import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Activity, 
  User as UserIcon, 
  Send, 
  Menu,
  Stethoscope,
  Heart,
  TrendingUp,
  AlertCircle,
  Sun,
  Moon,
  LogOut,
  Trash2,
  X,
  Mic,
  MicOff,
  Sparkles,
  Siren
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

import { AppView, ChatMessage, HealthMetrics, IntentType, SentimentType, User } from './types';
import AssessmentModal from './components/AssessmentModal';
import MLVisualizer from './components/MLVisualizer';
import AuthPage from './components/AuthPage';
import Profile from './components/Profile';
import HealthReportModal from './components/HealthReportModal';
import { sendMessageToGemini, analyzeIntentAndSentiment, initializeChat, generatePersonalizedInsight } from './services/geminiService';

// Type definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const App: React.FC = () => {
  // --- Auth & Theme State ---
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // --- App State ---
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  // --- Chat State ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- ML Analysis & Insights State ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<{intent: IntentType, sentiment: SentimentType, confidence: number} | undefined>(undefined);
  const [dailyInsight, setDailyInsight] = useState<string>("Analyzing your metrics to generate a personalized tip...");
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);

  // --- Health Data State ---
  const [metrics, setMetrics] = useState<HealthMetrics>({
    sleepScore: 75,
    stressScore: 60,
    dietScore: 40,
    activityScore: 50,
    overallScore: 60,
    lastUpdated: new Date()
  });

  // --- Initialization ---
  useEffect(() => {
    // Restore Theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');

    // Restore User
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Restore Metrics
    const savedMetrics = localStorage.getItem('metrics');
    if (savedMetrics) {
      const parsed = JSON.parse(savedMetrics);
      // Re-hydrate date object
      parsed.lastUpdated = new Date(parsed.lastUpdated);
      setMetrics(parsed);
    }

    // Restore Chat
    const savedChat = localStorage.getItem('chatHistory');
    if (savedChat) {
      const parsed = JSON.parse(savedChat);
      // Re-hydrate date objects
      const hydratedMessages = parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
      setMessages(hydratedMessages);
    }
    
    // Initialize Chat service
    initializeChat();
  }, []);

  // Fetch Daily Insight when user or metrics change
  useEffect(() => {
    const fetchInsight = async () => {
      if (user && metrics) {
        const insight = await generatePersonalizedInsight(metrics, user.name);
        setDailyInsight(insight);
      }
    };
    fetchInsight();
  }, [user, metrics]);

  // Apply Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist Metrics
  useEffect(() => {
    localStorage.setItem('metrics', JSON.stringify(metrics));
  }, [metrics]);

  // Persist Chat
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Initial Chat Message
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: `Hello ${user.name}! I'm HealthGuardian. I'm here to help you monitor your health habits. How are you feeling today?`,
        timestamp: new Date()
      }]);
    }
  }, [user]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showEmergencyAlert]);

  // --- Handlers ---

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setMessages([]);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete all your health data and chat history? This cannot be undone.")) {
      localStorage.clear();
      // Restore theme preference though, as that's usually global
      localStorage.setItem('theme', theme);
      
      setMessages([]);
      setMetrics({
        sleepScore: 75,
        stressScore: 60,
        dietScore: 40,
        activityScore: 50,
        overallScore: 60,
        lastUpdated: new Date()
      });
      alert("All data has been cleared.");
      if (user) localStorage.setItem('user', JSON.stringify(user));
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- Voice Input Handler ---
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
    };

    recognition.start();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);
    setIsAnalyzing(true);
    setLastAnalysis(undefined);
    setShowEmergencyAlert(false); // Reset alert on new message

    try {
      // Parallel execution: Chat Response + ML Analysis
      const [response, analysis] = await Promise.all([
        sendMessageToGemini(userMsg.text),
        analyzeIntentAndSentiment(userMsg.text)
      ]);

      setLastAnalysis(analysis);
      
      // Ethical Safety Guardrail
      if (analysis.isEmergency) {
        setShowEmergencyAlert(true);
      }
      
      // Simulate "thinking" time
      await new Promise(resolve => setTimeout(resolve, 800)); 

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date(),
        metadata: {
          intent: analysis.intent,
          sentiment: analysis.sentiment,
          confidence: analysis.confidence
        }
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
      setIsAnalyzing(false);
    }
  };

  const updateMetrics = (newMetrics: HealthMetrics) => {
    setMetrics(newMetrics);
    localStorage.setItem('hasAssessed', 'true');
  };

  const getHealthStatusColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthStatusText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 50) return 'Moderate';
    return 'Needs Attention';
  };

  // Mock Trend Data
  const trendData = [
    { day: 'Mon', score: 65 },
    { day: 'Tue', score: 58 },
    { day: 'Wed', score: 72 },
    { day: 'Thu', score: 68 },
    { day: 'Fri', score: 60 },
    { day: 'Sat', score: 85 },
    { day: 'Sun', score: metrics.overallScore },
  ];

  // --- Render Views ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Dynamic AI Insight Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-indigo-100 uppercase tracking-wider text-xs font-bold">
            <Sparkles className="w-4 h-4 animate-pulse" /> Daily AI Insight
          </div>
          <p className="text-xl font-medium leading-relaxed">"{dailyInsight}"</p>
          <button 
             onClick={() => setCurrentView(AppView.CHAT)}
             className="mt-4 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
          >
             Ask how to improve
          </button>
        </div>
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Activity className="w-48 h-48" />
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Health', value: metrics.overallScore, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Sleep Quality', value: metrics.sleepScore, icon: MoonIcon, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Stress Level', value: 100 - metrics.stressScore, inverse: true, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Activity', value: metrics.activityScore, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}%
              </h3>
              <p className={`text-xs ${stat.value >= 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {stat.value >= 70 ? 'Good condition' : 'Could improve'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Weekly Health Trend</h3>
            <button 
              onClick={() => setShowReport(true)}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View Report <TrendingUp className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: theme === 'dark' ? '#9ca3af' : '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: theme === 'dark' ? '#9ca3af' : '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      color: theme === 'dark' ? '#fff' : '#000'
                    }} 
                  />
                  <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Health Score Radial */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center relative transition-colors">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 w-full text-left">Health Score</h3>
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: metrics.overallScore }, { value: 100 - metrics.overallScore }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell key="cell-0" fill={metrics.overallScore > 70 ? '#10b981' : metrics.overallScore > 40 ? '#f59e0b' : '#ef4444'} />
                  <Cell key="cell-1" fill={theme === 'dark' ? '#1f2937' : '#f1f5f9'} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getHealthStatusColor(metrics.overallScore)}`}>
                {metrics.overallScore}
              </span>
              <span className="text-xs text-gray-400 uppercase tracking-wide">out of 100</span>
            </div>
          </div>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">
            Status: <span className={`font-semibold ${getHealthStatusColor(metrics.overallScore)}`}>{getHealthStatusText(metrics.overallScore)}</span>
          </p>
          <button 
            onClick={() => setShowAssessment(true)}
            className="mt-6 w-full py-2 px-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    </div>
  );

  // --- Main Render ---

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 font-bold text-xl text-primary-600 dark:text-primary-400">
            <Activity className="w-6 h-6" />
            <span>HealthGuardian</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button 
            onClick={() => { setCurrentView(AppView.DASHBOARD); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === AppView.DASHBOARD ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => { setCurrentView(AppView.CHAT); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === AppView.CHAT ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <MessageSquare className="w-5 h-5" /> AI Assistant
          </button>
          <button 
            onClick={() => { setCurrentView(AppView.ASSESSMENT); setIsSidebarOpen(false); setShowAssessment(true); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === AppView.ASSESSMENT ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Stethoscope className="w-5 h-5" /> Health Check
          </button>
          <button 
            onClick={() => { setCurrentView(AppView.PROFILE); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === AppView.PROFILE ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <UserIcon className="w-5 h-5" /> Profile
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
           <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 text-white flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate">{user.name}</p>
              </div>
           </div>
           
           <div className="flex gap-2 px-2">
             <button onClick={toggleTheme} className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors" title="Toggle Theme">
               {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>
             <button onClick={handleLogout} className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors" title="Logout">
               <LogOut className="w-5 h-5" />
             </button>
             <button onClick={handleClearData} className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Reset Data">
               <Trash2 className="w-5 h-5" />
             </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
           <div className="flex items-center gap-2 font-bold text-primary-600 dark:text-primary-400">
            <Activity className="w-6 h-6" />
            <span>HealthGuardian</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2">
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
           {currentView === AppView.DASHBOARD && renderDashboard()}
           
           {currentView === AppView.PROFILE && user && (
            <Profile 
              user={user}
              theme={theme}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
              onClearData={handleClearData}
              onToggleTheme={toggleTheme}
            />
           )}
           
           {currentView === AppView.CHAT && (
             <div className="h-full flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
               <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden h-[calc(100vh-8rem)] relative">
                 
                 {/* Ethical Emergency Overlay */}
                 {showEmergencyAlert && (
                   <div className="absolute top-0 left-0 right-0 bg-red-600 text-white p-4 z-20 animate-fade-in flex items-start gap-4">
                     <Siren className="w-8 h-8 shrink-0 animate-pulse" />
                     <div>
                       <h4 className="font-bold text-lg">Emergency Alert Detected</h4>
                       <p className="text-sm text-red-100">You seem to be describing critical symptoms. This AI cannot provide medical help.</p>
                       <div className="mt-2 font-bold bg-white/20 inline-block px-3 py-1 rounded">
                         Please call Emergency Services (911 / 112) immediately.
                       </div>
                     </div>
                     <button onClick={() => setShowEmergencyAlert(false)} className="ml-auto hover:bg-white/20 p-1 rounded">
                       <X className="w-5 h-5" />
                     </button>
                   </div>
                 )}

                 {/* Chat Messages */}
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {messages.map((msg) => (
                     <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[80%] rounded-2xl p-4 ${
                         msg.role === 'user' 
                           ? 'bg-primary-600 text-white rounded-br-none' 
                           : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                       }`}>
                         <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                         {msg.metadata && (
                           <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex gap-2 text-[10px] opacity-70">
                              {msg.metadata.intent && <span className="uppercase tracking-wider font-semibold">{msg.metadata.intent}</span>}
                              {msg.metadata.sentiment && <span>• {msg.metadata.sentiment}</span>}
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                   {isTyping && (
                     <div className="flex justify-start animate-pulse">
                       <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none p-4 text-gray-500 text-sm">
                         HealthGuardian is thinking...
                       </div>
                     </div>
                   )}
                   <div ref={chatEndRef} />
                 </div>

                 {/* Chat Input */}
                 <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                   <div className="flex gap-2">
                     <button
                        onClick={toggleListening}
                        className={`p-3 rounded-xl transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200'}`}
                        title="Voice Input"
                     >
                       {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                     </button>
                     <input
                       type="text"
                       value={inputMessage}
                       onChange={(e) => setInputMessage(e.target.value)}
                       onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                       placeholder={isListening ? "Listening..." : "Type a message..."}
                       className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                     />
                     <button 
                       onClick={handleSendMessage}
                       disabled={!inputMessage.trim() || isTyping}
                       className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
                     >
                       <Send className="w-5 h-5" />
                     </button>
                   </div>
                 </div>
               </div>

               {/* Right Side: ML Visualizer (Desktop) */}
               <div className="hidden lg:block w-80 h-[calc(100vh-8rem)]">
                 <MLVisualizer isProcessing={isAnalyzing} lastAnalysis={lastAnalysis} />
               </div>
             </div>
           )}

           {currentView === AppView.ASSESSMENT && (
             <div className="flex flex-col items-center justify-center h-full text-center p-8">
               <Stethoscope className="w-16 h-16 text-primary-200 mb-4" />
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Health Assessment</h2>
               <p className="text-gray-500 max-w-md mb-6">Update your health metrics to get personalized insights and tracking.</p>
               <button 
                 onClick={() => setShowAssessment(true)}
                 className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition"
               >
                 Start Assessment
               </button>
             </div>
           )}
        </div>
      </main>

      {/* Modals */}
      <HealthReportModal 
        isOpen={showReport} 
        onClose={() => setShowReport(false)} 
        metrics={metrics} 
        user={user} 
      />

      <AssessmentModal 
        isOpen={showAssessment} 
        onClose={() => setShowAssessment(false)} 
        onComplete={updateMetrics} 
      />
    </div>
  );
};

// Simple Icon components reused
const MoonIcon = ({className}:{className?:string}) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
)
const CheckIcon = ({className}:{className?:string}) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
)

export default App;