import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileCode, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Layers,
  Share2,
  Calendar,
  UserCheck
} from 'lucide-react';
import { exportToPDF, exportToMarkdown } from '../services/exportService';
import { generateAiMeetingMinutes } from '../services/geminiService';
import confetti from 'canvas-confetti';

export default function MeetingMinutes({ 
  messages, 
  currentProject, 
  apiKey,
  onUpdateProject 
}) {
  const [minutes, setMinutes] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize minutes with default or generated data
  useEffect(() => {
    if (!minutes) {
      handleGenerateMinutes();
    }
  }, [currentProject]);

  const handleGenerateMinutes = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateAiMeetingMinutes({
        dialogueList: messages,
        projectInfo: currentProject,
        apiKey: apiKey
      });
      setMinutes(generated);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {
      console.error('Failed to generate minutes:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!minutes) return;
    exportToPDF(minutes, currentProject);
  };

  const handleCopyMarkdown = () => {
    if (!minutes) return;
    const md = exportToMarkdown(minutes);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!minutes) return null;

  const ribaSteps = [
    { stage: 'Stage 1', name: 'Brief' },
    { stage: 'Stage 2', name: 'Concept' },
    { stage: 'Stage 3', name: 'Spatial' },
    { stage: 'Stage 4', name: 'Technical' },
    { stage: 'Stage 5', name: 'Construction' },
    { stage: 'Stage 6', name: 'Handover' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      
      {/* Top Header / Actions Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>RIBA 표준 건축 회의록 (Architectural Minutes)</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {minutes.ribaStage}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            프로젝트: <strong className="text-slate-200">{minutes.projectTitle}</strong> (Ref: {minutes.projectNumber}) | 일자: {minutes.meetingDate}
          </p>
        </div>

        {/* Export and AI Generate actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerateMinutes}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white shadow-md transition disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'AI 회의록 분석 중...' : 'AI 회의록 새로고침'}</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>MD 복사</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>표준 PDF 다운로드</span>
          </button>
        </div>

      </div>

      {/* RIBA Plan of Work Milestone Progress Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
        <span className="text-[11px] font-bold text-slate-400 mb-3 block">
          🏛️ RIBA Plan of Work 진행 단계:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {ribaSteps.map((step, idx) => {
            const isCurrent = minutes.ribaStage.includes(step.stage);
            const isPast = idx < 2; // concept / spatial stage
            return (
              <div 
                key={step.stage}
                className={`p-2.5 rounded-xl border text-center transition ${
                  isCurrent 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-lg shadow-amber-500/10' 
                    : isPast 
                    ? 'bg-slate-800/60 border-slate-700 text-slate-300' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-[10px] font-semibold opacity-75">{step.stage}</div>
                <div className="text-xs font-bold truncate">{step.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-amber-400 tracking-wider uppercase mb-2 flex items-center gap-1.5">
          <span>1. 총괄 요약 (Executive Summary)</span>
        </h3>
        <p className="text-xs font-medium text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
          {minutes.executiveSummary}
        </p>
      </div>

      {/* Decisions Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>2. 주요 건축 & 기술 합의사항 (Key Decisions)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(minutes.decisions || []).map((dec, idx) => (
            <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {dec.id}
                </span>
                <h4 className="text-xs font-bold text-slate-200">{dec.title}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {dec.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>3. 액션 아이템 & 산출물 납품 매트릭스 (Action Items)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-700">
              <tr>
                <th className="p-3">번호</th>
                <th className="p-3">업무 및 산출물 과제</th>
                <th className="p-3">담당자 (Lead)</th>
                <th className="p-3">마감 기한 (BST)</th>
                <th className="p-3">진행 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(minutes.actionItems || []).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-bold text-slate-400">{item.id}</td>
                  <td className="p-3 font-medium text-slate-200">{item.task}</td>
                  <td className="p-3 text-amber-300 font-semibold">{item.assignee}</td>
                  <td className="p-3 text-slate-400">{item.dueDate}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'In Progress' 
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : item.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulatory Risks & Drawings Matrix (Dual Column) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* UK Regulatory Risks */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-rose-400 tracking-wider uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>4. 영국 법규 및 인허가 리스크 (Statutory Risks)</span>
          </h3>
          <div className="space-y-2">
            {(minutes.regulatoryRisks || []).map((risk, idx) => (
              <div key={idx} className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-200 leading-relaxed">
                • {risk}
              </div>
            ))}
          </div>
        </div>

        {/* Referenced Drawings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-sky-400 tracking-wider uppercase flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-sky-400" />
            <span>5. 참조 도면 및 BIM 모델 목록 (Drawings)</span>
          </h3>
          <div className="space-y-2">
            {(minutes.drawingsReferenced || []).map((dwg, idx) => (
              <div key={idx} className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>{dwg}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Official Sign-off Box */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span>공식 회의록 서명 및 배포 승인 (Sign-off)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
            <span className="font-bold text-slate-300 block mb-1">UK Lead Architect (Oliver Hughes, RIBA):</span>
            <div className="h-8 border-b border-dashed border-slate-600 flex items-end pb-1 text-slate-500 italic">
              [전자 서명 완료 - 2026-08-23 15:45 BST]
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
            <span className="font-bold text-slate-300 block mb-1">Seoul Project Director (Dr. Minwoo Kim):</span>
            <div className="h-8 border-b border-dashed border-slate-600 flex items-end pb-1 text-slate-500 italic">
              [전자 서명 완료 - 2026-08-23 23:45 KST]
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}