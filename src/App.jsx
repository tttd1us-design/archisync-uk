import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LiveInterpreter from './components/LiveInterpreter';
import MeetingMinutes from './components/MeetingMinutes';
import GlossaryModal from './components/GlossaryModal';
import DrawingViewerModal from './components/DrawingViewerModal';
import SettingsModal from './components/SettingsModal';
import { DEMO_SCENARIOS } from './data/demoScenarios';

export default function App() {
  const [activeTab, setActiveTab] = useState('interpreter'); // 'interpreter' | 'minutes'
  const [selectedScenarioId, setSelectedScenarioId] = useState('canary-wharf-stage3');
  
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Application Header */}
      <Header
        currentProject={currentProject}
        onProjectChange={setCurrentProject}
        onOpenGlossary={() => { setGlossaryInitialSearch(''); setIsGlossaryOpen(true); }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDrawings={() => setIsDrawingsOpen(true)}
        hasApiKey={Boolean(apiKey)}
        isLive={messages.length > 0}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
          />
        ) : (
          <MeetingMinutes
            messages={messages}
            currentProject={currentProject}
            apiKey={apiKey}
            onUpdateProject={setCurrentProject}
          />
        )}
      </main>

      {/* Modals */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        initialSearchTerm={glossaryInitialSearch}
      />

      <DrawingViewerModal
        isOpen={isDrawingsOpen}
        onClose={() => setIsDrawingsOpen(false)}
        latestMessage={messages[messages.length - 1]}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

    </div>
  );
}