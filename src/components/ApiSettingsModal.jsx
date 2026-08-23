import React, { useState } from 'react';
import { 
  Key, 
  X, 
  Save, 
  Check, 
  Sparkles, 
  ShieldAlert, 
  Cpu
} from 'lucide-react';

export default function ApiSettingsModal({ isOpen, onClose, apiSettings, onSaveApiSettings }) {
  if (!isOpen) return null;

  const [settings, setSettings] = useState({ ...apiSettings });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiSettings(settings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI 엔진 & API 키 설정 (BYOK)</h3>
              <p className="text-xs text-slate-400">자체 API 키를 입력하거나 내장 고성능 엔진을 사용할 수 있습니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">AI 분석 엔진 선택</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, provider: 'gemini' })}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  settings.provider === 'gemini'
                    ? 'bg-indigo-950 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Google Gemini 1.5/2.0</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">초고속 실시간 요약 (권장)</span>
              </button>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, provider: 'offline' })}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  settings.provider === 'offline'
                    ? 'bg-emerald-950 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>내장 스마트 로컬 엔진</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">API 키 없이 즉시 분석</span>
              </button>
            </div>
          </div>

          {/* Gemini API Key */}
          {settings.provider === 'gemini' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Google Gemini API Key (선택)</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={settings.geminiApiKey || ''}
                onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">API Key를 입력하지 않으면 내장 고품질 지능형 엔진으로 자동 대체됩니다.</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>모든 API Key 및 회의 데이터는 사용자의 로컬 브라우저(LocalStorage)에만 안전하게 저장되며 외부 서버로 무단 전송되지 않습니다.</span>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              닫기
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saved ? '저장됨' : '설정 저장'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
