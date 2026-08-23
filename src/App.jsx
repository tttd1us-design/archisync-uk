import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LiveInterpreter from './components/LiveInterpreter';
import MeetingMinutes from './components/MeetingMinutes';
import GlossaryModal from './components/GlossaryModal';
import DrawingViewerModal from './components/DrawingViewerModal';
import SettingsModal from './components/SettingsModal';
import IosInstallModal from './components/IosInstallModal';
import { DEMO_SCENARIOS } from './data/demoScenarios';

// 🛡️ Fail-Safe Error Boundary (Guarantees zero black screens on unhandled errors)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical Application Crash caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-rose-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <span className="text-4xl">⚠️</span>
            <h1 className="text-lg font-black text-rose-400">시스템 일시 오류 자동 감지</h1>
            <p className="text-xs text-slate-300">
              렌더링 중 예기치 않은 오류가 발생했습니다. 아래 복구 버튼을 누르면 즉시 정상 작동합니다.
            </p>
            <div className="p-3 bg-slate-950 rounded-lg text-left text-[11px] font-mono text-rose-300 overflow-x-auto max-h-32 border border-slate-800">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
            >
              🔄 즉시 정상 복구 (새로고침)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('interpreter'); // 'interpreter' | 'minutes'
  const [selectedScenarioId, setSelectedScenarioId] = useState('canary-wharf-stage3');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('archisync_theme') || 'dark';
  });
  
  const [currentProject, setCurrentProject] = useState({
    title: 'Canary Wharf Mixed-Use Tower (Phase 2)',
    projectNumber: 'UK-CW-2026-03',
    ribaStage: 'RIBA Stage 3 (Spatial Coordination)',
    location: 'London E14 / Seoul'
  });

  const [messages, setMessages] = useState([]);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('archisync_gemini_key') || '';
  });

  // Modals state
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [glossaryInitialSearch, setGlossaryInitialSearch] = useState('');
  const [isDrawingsOpen, setIsDrawingsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIosInstallOpen, setIsIosInstallOpen] = useState(false);

  // Toggle Theme (dark/black <-> light/white)
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('archisync_theme', nextTheme);
  };

  // Sync project info when scenario changes
  const handleScenarioChange = (scenarioId) => {
    setSelectedScenarioId(scenarioId);
    const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      setCurrentProject({
        title: scenario.title,
        projectNumber: scenario.sampleMinutes?.projectNumber || 'UK-AR-2026',
        ribaStage: scenario.ribaStage,
        location: scenario.location
      });
      setMessages([]);
    }
  };

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('archisync_gemini_key', newKey);
  };

  const handleOpenGlossaryWithTerm = (term) => {
    setGlossaryInitialSearch(term);
    setIsGlossaryOpen(true);
  };

  const isDark = theme === 'dark';

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark 
          ? 'bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950' 
          : 'bg-slate-100 text-slate-900 selection:bg-indigo-500 selection:text-white'
      }`}>
        
        {/* Top Application Header */}
        <Header
          currentProject={currentProject}
          onProjectChange={setCurrentProject}
          onOpenGlossary={() => { setGlossaryInitialSearch(''); setIsGlossaryOpen(true); }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenDrawings={() => setIsDrawingsOpen(true)}
          onOpenIosInstall={() => setIsIosInstallOpen(true)}
          hasApiKey={Boolean(apiKey)}
          isLive={messages.length > 0}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Main Workspace Body */}
        <main className="flex-1">
          {activeTab === 'interpreter' ? (
            <LiveInterpreter
              messages={messages}
              setMessages={setMessages}
              apiKey={apiKey}
              selectedScenarioId={selectedScenarioId}
              onSelectedScenarioChange={handleScenarioChange}
              onOpenGlossaryWithTerm={handleOpenGlossaryWithTerm}
              theme={theme}
            />
          ) : (
            <MeetingMinutes
              messages={messages}
              currentProject={currentProject}
              apiKey={apiKey}
              onUpdateProject={setCurrentProject}
              theme={theme}
            />
          )}
        </main>

        {/* Modals: Rendered ONLY when opened to eliminate background DOM load */}
        {isGlossaryOpen && (
          <GlossaryModal
            isOpen={isGlossaryOpen}
            onClose={() => setIsGlossaryOpen(false)}
            initialSearchTerm={glossaryInitialSearch}
          />
        )}

        {isDrawingsOpen && (
          <DrawingViewerModal
            isOpen={isDrawingsOpen}
            onClose={() => setIsDrawingsOpen(false)}
            latestMessage={messages[messages.length - 1]}
          />
        )}

        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            apiKey={apiKey}
            onSaveApiKey={handleSaveApiKey}
          />
        )}

        {isIosInstallOpen && (
          <IosInstallModal
            isOpen={isIosInstallOpen}
            onClose={() => setIsIosInstallOpen(false)}
          />
        )}

      </div>
    </ErrorBoundary>
  );
}