import React from 'react';
import { 
  Building2, 
  BookOpen, 
  Settings, 
  Layers, 
  FileText, 
  Sun, 
  Moon 
} from 'lucide-react';

export default function Header({ 
  onOpenGlossary, 
  onOpenSettings, 
  activeTab, 
  setActiveTab, 
  theme = 'dark', 
  onToggleTheme 
}) {
  const isDark = theme === 'dark';

  return (
    <header className={`${
      isDark ? 'bg-slate-950/90 border-b border-slate-800/80 text-white' : 'bg-white border-b border-slate-200 text-slate-900'
    } sticky top-0 z-40 backdrop-blur-md transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Product Title */}
          <div className="flex items-center space-x-2.5">
            <div className="bg-gradient-to-br from-amber-500 to-indigo-600 p-1.5 rounded-lg text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight">
                ArchiSync <span className="text-amber-500">UK</span>
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-800 border border-amber-300'
              }`}>
                ⚡ 🌐 다국어 ➔ 한글 실시간 통역
              </span>
            </div>
          </div>

          {/* Navigation Tabs & Actions */}
          <div className="flex items-center space-x-2">
            
            {/* Tabs */}
            <div className={`flex items-center p-1 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setActiveTab('interpreter')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeTab === 'interpreter'
                    ? isDark 
                      ? 'bg-amber-500 text-slate-950 shadow-sm' 
                      : 'bg-white text-indigo-950 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>실시간 통역</span>
              </button>

              <button
                onClick={() => setActiveTab('minutes')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeTab === 'minutes'
                    ? isDark 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-white text-indigo-950 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>회의록 생성</span>
              </button>
            </div>

            {/* Quick Actions (Glossary, Settings, Theme) */}
            <div className="flex items-center space-x-1 pl-2 border-l border-slate-700/50">
              <button
                onClick={onOpenGlossary}
                className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                  isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
                title="건축 전문 용어 사전"
              >
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span className="hidden md:inline">용어사전</span>
              </button>

              <button
                onClick={onOpenSettings}
                className={`p-1.5 rounded-lg border transition ${
                  isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
                title="설정 (Gemini API 키)"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={onToggleTheme}
                className={`p-1.5 rounded-lg border transition ${
                  isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
                title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
