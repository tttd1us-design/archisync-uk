import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  FileText, 
  Download, 
  Printer,
  Table
} from 'lucide-react';
import { exportService } from '../services/exportService';

export default function ExportModal({ isOpen, onClose, meeting }) {
  if (!isOpen || !meeting) return null;

  const [activeTab, setActiveTab] = useState('notion'); // 'notion' | 'slack' | 'jira' | 'markdown'
  const [copied, setCopied] = useState(false);

  const notionContent = exportService.toNotionMarkdown(meeting);
  const slackContent = exportService.toSlackBlock(meeting);
  const jiraContent = exportService.toJiraCsv(meeting);

  const getCurrentContent = () => {
    if (activeTab === 'notion') return notionContent;
    if (activeTab === 'slack') return slackContent;
    if (activeTab === 'jira') return jiraContent;
    return notionContent;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (activeTab === 'jira') {
      exportService.downloadFile(jiraContent, `${meeting.title}_Jira_Tasks.csv`, 'text/csv;charset=utf-8');
    } else {
      exportService.downloadFile(getCurrentContent(), `${meeting.title}_회의록.md`, 'text/markdown;charset=utf-8');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">회의록 및 액션아이템 내보내기 & 협업 툴 연동</h3>
              <p className="text-xs text-slate-400">원클릭으로 노션, 슬랙, 지라 포맷에 맞게 복사하거나 파일로 저장하세요.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integration Platform Tabs */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('notion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'notion' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Notion 템플릿 (.md)
          </button>
          <button
            onClick={() => setActiveTab('slack')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'slack' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Slack 메시지 블록
          </button>
          <button
            onClick={() => setActiveTab('jira')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'jira' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Jira 티켓 CSV
          </button>
        </div>

        {/* Content Preview Box */}
        <div className="flex-1 overflow-y-auto mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
          {getCurrentContent()}
        </div>

        {/* Modal Footer Controls */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white border border-slate-800"
          >
            <Printer className="w-3.5 h-3.5" /> PDF 인쇄
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{activeTab === 'jira' ? 'CSV 파일 다운로드' : '마크다운 다운로드'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '클립보드 복사 완료!' : '클립보드 복사'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
