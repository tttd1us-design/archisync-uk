import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  Zap, 
  ShieldCheck, 
  X, 
  Sparkles, 
  Building2,
  Key
} from 'lucide-react';

export default function PricingLicenseModal({ isOpen, onClose, license, onSaveLicense }) {
  if (!isOpen) return null;

  const [inputKey, setInputKey] = useState('');
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  const handleActivate = (e) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    const newLic = {
      plan: inputKey.toUpperCase().includes('ENT') ? 'ENTERPRISE' : 'PRO',
      status: 'active',
      key: inputKey.trim().toUpperCase(),
      expiresAt: '2027-12-31'
    };

    onSaveLicense(newLic);
    setActivatedSuccess(true);
    setTimeout(() => {
      setActivatedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">MeetFlow AI Commercial Plans</span>
            <h3 className="text-xl font-bold text-white mt-1">상용 라이선스 & 요금제 안내</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {/* Starter Tier */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400">STARTER</span>
              <div className="text-2xl font-black text-white mt-2">무료 <span className="text-xs font-normal text-slate-400">/ 영구</span></div>
              <p className="text-xs text-slate-400 mt-1">개인 가벼운 회의 및 테스트용</p>
              
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> 월 5회 무료 음성 전사</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> 기본 IT/일반 사전 제공</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> 3줄 핵심 요약</li>
              </ul>
            </div>
            <button className="w-full mt-6 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 cursor-default">
              기본 제공 플랜
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-slate-950 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500 text-white uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-400">PRO (개인/팀장용)</span>
              <div className="text-2xl font-black text-white mt-2">₩ 29,000 <span className="text-xs font-normal text-slate-400">/ 월</span></div>
              <p className="text-xs text-indigo-300/80 mt-1">회의록 작성 시간을 90% 줄여주는 프로페셔널 툴</p>
              
              <ul className="mt-4 space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" /> <strong>무제한</strong> 실시간 회의 전사 & 분석</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" /> 4대 전 업계 특화 사전 풀세트</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" /> 사내 줄임말/용어집 무제한 등록</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" /> Notion / Slack / Jira 원클릭 연동</li>
              </ul>
            </div>
            <div className="w-full mt-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white text-center shadow-lg shadow-indigo-600/30">
              현재 활성화됨 ({license?.plan})
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-purple-400">ENTERPRISE (기업용)</span>
              <div className="text-2xl font-black text-white mt-2">₩ 99,000 <span className="text-xs font-normal text-slate-400">/ 사내 전사 라이선스</span></div>
              <p className="text-xs text-slate-400 mt-1">보안 강화 온프레미스 & 전사 싱크</p>
              
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> 사내 전용 격리 LLM 모델 커스텀 파인튜닝</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> SSO / LDAP 사내 보안 연동</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> 전담 테크니컬 어카운트 매니저(TAM)</li>
              </ul>
            </div>
            <button className="w-full mt-6 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors">
              도입 문의하기
            </button>
          </div>
        </div>

        {/* License Key Activation Box */}
        <form onSubmit={handleActivate} className="mt-8 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Key className="w-4 h-4 text-amber-400" />
            <span>라이선스 키 활성화:</span>
          </div>
          <div className="flex-1 flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="예: MEETFLOW-PRO-2026-KEY"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shrink-0 transition-colors"
            >
              {activatedSuccess ? '활성화 성공!' : '키 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
