import React from 'react';
import { INDUSTRY_DICTIONARIES } from '../data/industryDictionaries';
import { 
  Code2, 
  TrendingUp, 
  Factory, 
  Megaphone, 
  Briefcase, 
  Check, 
  SlidersHorizontal,
  Layers
} from 'lucide-react';

const ICONS = {
  Code2,
  TrendingUp,
  Factory,
  Megaphone,
  Briefcase
};

export default function IndustrySelector({ selectedIndustry, onSelectIndustry, customDictCount = 0 }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200">1. 회의 업계 도메인 사전 선택 (AI 전사 최적화)</h2>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          사내 맞춤 줄임말 <strong className="text-indigo-400 font-medium">+{customDictCount}개</strong> 자동 결합 적용 중
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.values(INDUSTRY_DICTIONARIES).map((ind) => {
          const IconComponent = ICONS[ind.icon] || Briefcase;
          const isSelected = selectedIndustry === ind.id;

          return (
            <button
              key={ind.id}
              onClick={() => onSelectIndustry(ind.id)}
              className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all duration-200 group ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 text-white bg-gradient-to-br ${ind.color} shadow-md`}>
                <IconComponent className="w-4 h-4" />
              </div>

              <span className={`text-xs font-bold mb-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                {ind.name}
              </span>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {ind.description}
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center gap-1">
                <span className="text-[10px] text-indigo-400/80 font-mono">
                  {ind.terms.length}개 전문용어 탑재
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
