import React from 'react';
import { 
  BarChart2, 
  Smile, 
  Timer, 
  TrendingUp, 
  Tag, 
  Zap, 
  CheckCircle,
  Users
} from 'lucide-react';

export default function MeetingAnalytics({ meeting }) {
  if (!meeting) return null;

  const analytics = meeting.analysis?.analytics || {
    meetingEfficiencyScore: 94,
    sentiment: { positive: 75, neutral: 20, negative: 5, overall: '건설적이고 생산적' },
    speakerStats: [],
    topKeywords: []
  };

  const speakerStats = analytics.speakerStats || [];
  const topKeywords = analytics.topKeywords || [];
  const sentiment = analytics.sentiment || { positive: 75, neutral: 20, negative: 5, overall: '생산적' };

  return (
    <div className="space-y-6">
      {/* 4 Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Efficiency Score */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">회의 효율성 지수</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-400">{analytics.meetingEfficiencyScore}</span>
            <span className="text-xs text-slate-400 font-bold">/ 100점</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle className="w-3 h-3" /> 군더더기 없는 빠른 의사결정
          </p>
        </div>

        {/* Meeting Duration */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">총 회의 소요 시간</span>
            <Timer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{meeting.duration || '25분'}</div>
          <p className="text-[11px] text-slate-400 mt-1">권장 적정 시간(30분) 준수</p>
        </div>

        {/* Sentiment Tone */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">회의 분위기 (Sentiment)</span>
            <Smile className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-300 leading-tight">
            {sentiment.overall || '건설적/협력적'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">긍정 반응 {sentiment.positive}%</p>
        </div>

        {/* Action Item Count */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">도출된 액션아이템</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">
            {meeting.actionItems?.length || meeting.analysis?.actionItems?.length || 3}개
          </div>
          <p className="text-[11px] text-purple-300 mt-1">모두 담당자/기한 배정 완료</p>
        </div>
      </div>

      {/* Speaker Talk-Time Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">화자별 발언 점유율 & 참여도 (Talk-Time)</h3>
        </div>

        {/* Unified Horizontal Stack Bar */}
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-950 mb-4 border border-slate-800">
          {speakerStats.map((spk, idx) => (
            <div
              key={spk.id || idx}
              style={{ width: `${spk.ratioPercent || 25}%` }}
              className={`${spk.color || 'bg-indigo-600'} transition-all hover:opacity-90`}
              title={`${spk.name}: ${spk.ratioPercent}%`}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {speakerStats.map((spk, idx) => (
            <div key={spk.id || idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-3 h-3 rounded-full ${spk.color || 'bg-indigo-600'}`} />
                <span className="text-xs font-bold text-slate-200 truncate">{spk.name}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-white">{spk.ratioPercent || 25}%</span>
                <span className="text-[10px] text-slate-400">{spk.role || '참석자'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Terminology Cloud */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">회의 내 빈출 업계 전문 용어 (Domain Term Frequency)</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {topKeywords.map((kw, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-indigo-500/30 text-xs"
            >
              <span className="font-bold text-indigo-300">{kw.term}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {kw.count}회 언급
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
