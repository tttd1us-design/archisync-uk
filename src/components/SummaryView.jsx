import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  ListChecks, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Award
} from 'lucide-react';

export default function SummaryView({ meeting }) {
  if (!meeting) return null;

  const analysis = meeting.analysis || {};
  const executiveSummary = analysis.executiveSummary || [];
  const keyDecisions = analysis.keyDecisions || [];
  const agendaTopics = analysis.agendaTopics || [];
  const openQuestions = analysis.openQuestions || [];

  return (
    <div className="space-y-6">
      {/* 3-Bullet Executive Summary */}
      <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                경영진/리더용 3줄 핵심 요약 (Executive Summary)
              </h3>
              <p className="text-[11px] text-indigo-300/80">바쁜 리더들을 위해 수치와 핵심 결론만 정밀 압축했습니다.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            AI 신뢰도 98%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {executiveSummary.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/20 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold mb-2">
                  0{idx + 1}
                </span>
                <h4 className="text-xs font-bold text-slate-100 mb-1 leading-snug">{item.title}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Decisions Made */}
      {keyDecisions.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">주요 의사결정 사항 (Key Decisions)</h3>
          </div>
          <div className="space-y-2.5">
            {keyDecisions.map((dec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20"
              >
                <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-200">{dec.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{dec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agenda Topics Deep-Dive */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">어젠다별 심층 논의 & 결정 사항</h3>
        </div>

        <div className="space-y-3.5">
          {agendaTopics.map((ag, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <h4 className="text-xs font-bold text-indigo-300 mb-1.5">{ag.topic}</h4>
              <p className="text-xs text-slate-200 mb-2.5 leading-relaxed">{ag.summary}</p>
              
              {ag.keyPoints && (
                <div className="space-y-1 pl-2 border-l-2 border-slate-800">
                  {ag.keyPoints.map((kp, kIdx) => (
                    <div key={kIdx} className="flex items-center gap-2 text-[11px] text-slate-400">
                      <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>{kp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Open Questions / Follow-ups */}
      {openQuestions.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">차기 회의 전 확인 사항 & 미결 안건</h3>
          </div>
          <div className="space-y-2">
            {openQuestions.map((q, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-amber-200/90 p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
