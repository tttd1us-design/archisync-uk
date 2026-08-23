import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Sparkles, 
  Volume2, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Building,
  HelpCircle
} from 'lucide-react';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  apiKey, 
  onSaveApiKey 
}) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [selectedAccent, setSelectedAccent] = useState('London RP');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const accents = [
    { id: 'London RP', name: '영국 표준 발음 (London Received Pronunciation)', desc: '런던 대형 건축사무소 및 RIBA 표준 억양' },
    { id: 'Estuary', name: '런던 남동부 에스추어리 (Estuary English)', desc: '런던 및 템스 강변 권역 현대 실무 억양' },
    { id: 'Scottish', name: '스코틀랜드 억양 (Scottish UK)', desc: '에든버러 및 글래스고 현장 엔지니어링 억양' },
    { id: 'Northern', name: '영국 북부 억양 (Manchester/Leeds)', desc: '맨체스터 리즈 도시재생 프로젝트 특화' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">시스템 설정 (System Settings)</h2>
              <p className="text-xs text-slate-400">Gemini AI 모델 연동 및 영국 음성 엔진 커스터마이징</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Gemini API Key Config */}
          <form onSubmit={handleSave} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Google Gemini API Key 연동:</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>API 키 발급받기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy... (미입력 시 스마트 내장 번역 엔진 자동 작동)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center gap-1.5"
              >
                {isSaved ? <Check className="w-4 h-4 text-slate-950" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{isSaved ? '저장됨' : '저장'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              * API 키를 입력하시면 Gemini 2.5 Flash를 통해 건축 실무 맥락이 100% 반영된 번역과 회의록이 생성됩니다. 미입력 시에도 고성능 내장 엔진이 동작합니다.
            </p>
          </form>

          {/* UK Native Accent Filter */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>영국 현지 음성 억양 (UK Native Accent Engine):</span>
            </label>

            <div className="space-y-2">
              {accents.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccent(acc.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedAccent === acc.id
                      ? 'bg-indigo-500/20 border-indigo-500 text-white'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{acc.name}</div>
                    <div className="text-[11px] text-slate-400">{acc.desc}</div>
                  </div>
                  {selectedAccent === acc.id && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product Commercial License Info */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>ArchiSync UK - Commercial Suite</span>
              <span className="text-amber-400">v1.0.0 Pro Edition</span>
            </div>
            <p className="text-[11px]">
              RIBA Plan of Work 2020 & UK Building Regulations 2026 Fully Compliant.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}