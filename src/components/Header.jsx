import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  BookOpen, 
  Settings, 
  FolderGit2, 
  Layers, 
  FileText, 
  Sparkles,
  Volume2,
  Clock,
  ExternalLink,
  Smartphone,
  Sun,
  Moon
} from 'lucide-react';

export default function Header({ 
  currentProject, 
  onProjectChange, 
  onOpenGlossary, 
  onOpenSettings, 
  onOpenDrawings,
  onOpenMinutes,
  onOpenIosInstall,
  hasApiKey,
  isLive,
  activeTab,
  setActiveTab,
  theme = 'dark',
  onToggleTheme
}) {
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const isDark = theme === 'dark';

  useEffect(() => {
    let timer;
    if (isLive) {
      timer = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLive]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const ribaStages = [
    'RIBA Stage 1 (Preparation & Brief)',
    'RIBA Stage 2 (Concept Design)',
    'RIBA Stage 3 (Spatial Coordination)',
    'RIBA Stage 4 (Technical Design)',
    'RIBA Stage 5 (Manufacturing & Construction)',
    'RIBA Stage 6 (Handover / Snagging)'
  ];

  return (
    <header className={`${
      isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-200'
    } sticky top-0 z-40 shadow-lg transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Product Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-amber-500 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ArchiSync <span className="text-amber-500">UK</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  🇬🇧 UK · 🇺🇸 US · 🇯🇵 JP · 🇨🇳 CN Global Edition
                </span>
                {hasApiKey ? (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  } flex items-center gap-1`}>
                    <Sparkles className="w-3 h-3" /> Gemini 2.5 Active
                  </span>
                ) : (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    Smart Fallback Mode
                  </span>
                )}
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                영국·미국·일본·중국 건축설계 글로벌 실시간 AI 통역 & RIBA 회의록 시스템
              </p>
            </div>
          </div>

          {/* RIBA Stage Selector & Session Timer */}
          <div className="hidden md:flex items-center space-x-4">
            <div className={`flex items-center px-3 py-1.5 rounded-lg border ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-300'
            }`}>
              <Layers className="w-4 h-4 text-amber-500 mr-2" />
              <select 
                value={currentProject.ribaStage}
                onChange={(e) => onProjectChange({ ...currentProject, ribaStage: e.target.value })}
                className={`bg-transparent text-xs font-semibold focus:outline-none cursor-pointer ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                {ribaStages.map((stage) => (
                  <option key={stage} value={stage} className={isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            {isLive && (
              <div className="flex items-center bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg text-rose-500 text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-ping" />
                <Clock className="w-3.5 h-3.5 mr-1" />
                REC {formatTime(sessionSeconds)}
              </div>
            )}
          </div>

          {/* Navigation Controls & Theme Switcher */}
          <div className="flex items-center space-x-2">
            
            {/* 🌓 Black / White Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition shadow-sm ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 hover:border-amber-400/50' 
                  : 'bg-slate-100 hover:bg-slate-200 text-indigo-700 border-slate-300 hover:border-indigo-400'
              }`}
              title={isDark ? '☀️ 화이트(라이트) 모드로 전환' : '🌙 블랙(다크) 모드로 전환'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>☀️ 화이트</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600 fill-current" />
                  <span>🌙 블랙</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenIosInstall}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                isDark 
                  ? 'text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40' 
                  : 'text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300'
              }`}
              title="아이폰 / 아이패드 앱(PWA) 설치 가이드"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">📱 iOS 앱</span>
            </button>

            <button
              onClick={onOpenDrawings}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isDark ? 'text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border-slate-700' : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
              title="건축 도면 뷰어 & HUD 자막 모드"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">도면 HUD</span>
            </button>

            <button
              onClick={onOpenGlossary}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isDark ? 'text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border-slate-700' : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
              title="영국 건축 전문 용어사전 (3,000+)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">용어집</span>
            </button>

            <button
              onClick={onOpenSettings}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isDark ? 'text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border-slate-700' : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
              title="AI & 음성 설정"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">설정</span>
            </button>
          </div>

        </div>

        {/* Tab switcher for Mobile / Split navigation */}
        <div className={`flex space-x-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} pt-2 pb-2`}>
          <button
            onClick={() => setActiveTab('interpreter')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition flex items-center justify-center space-x-2 ${
              activeTab === 'interpreter' 
                ? isDark 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                  : 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>실시간 통역 (Live Dual Track)</span>
          </button>
          <button
            onClick={() => setActiveTab('minutes')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition flex items-center justify-center space-x-2 ${
              activeTab === 'minutes' 
                ? isDark 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' 
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300 shadow-sm'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>AI 회의록 (RIBA Minutes & Action Items)</span>
          </button>
        </div>

      </div>
    </header>
  );
}