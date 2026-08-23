import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LiveInterpreter from './components/LiveInterpreter';
import MeetingMinutes from './components/MeetingMinutes';
import GlossaryModal from './components/GlossaryModal';
import DrawingViewerModal from './components/DrawingViewerModal';
import SettingsModal from './components/SettingsModal';
import IosInstallModal from './components/IosInstallModal';
import { DEMO_SCENARIOS } from './data/demoScenarios';

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
  );
}