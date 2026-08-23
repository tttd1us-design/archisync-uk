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
  ExternalLink
} from 'lucide-react';

export default function Header({ 
  currentProject, 
  onProjectChange, 
  onOpenGlossary, 
  onOpenSettings, 
  onOpenDrawings,
  onOpenMinutes,
  hasApiKey,
  isLive,
  activeTab,
  setActiveTab
}) {
  const [sessionSeconds, setSessionSeconds] = useState(0);

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
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Product Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-amber-500 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white">
                  ArchiSync <span className="text-amber-400">UK</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  🇬🇧 UK Architect Edition
                </span>
                {hasApiKey ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Gemini 2.5 Active
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Smart Fallback Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                영국 건축설계 특화 실시간 AI 통역 & RIBA 회의록 시스템
              </p>
            </div>
          </div>

          {/* RIBA Stage Selector & Session Timer */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Layers className="w-4 h-4 text-amber-400 mr-2" />
              <select 
                value={currentProject.ribaStage}
                onChange={(e) => onProjectChange({ ...currentProject, ribaStage: e.target.value })}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
              >
                {ribaStages.map((stage) => (
                  <option key={stage} value={stage} className="bg-slate-800 text-slate-200">
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            {isLive && (
              <div className="flex items-center bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg text-rose-400 text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-ping" />
                <Clock className="w-3.5 h-3.5 mr-1" />
                REC {formatTime(sessionSeconds)}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenDrawings}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="건축 도면 뷰어 & HUD 자막 모드"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">도면 HUD</span>
            </button>

            <button
              onClick={onOpenGlossary}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="영국 건축 전문 용어사전 (3,000+)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">용어집</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="AI & 음성 설정"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">설정</span>
            </button>
          </div>

        </div>

        {/* Tab switcher for Mobile / Split navigation */}
        <div className="flex space-x-1 border-t border-slate-800 pt-2 pb-2">
          <button
            onClick={() => setActiveTab('interpreter')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition flex items-center justify-center space-x-2 ${
              activeTab === 'interpreter' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>실시간 통역 (Live Dual Track)</span>
          </button>
          <button
            onClick={() => setActiveTab('minutes')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition flex items-center justify-center space-x-2 ${
              activeTab === 'minutes' 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' 
                : 'text-slate-400 hover:text-slate-200'
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