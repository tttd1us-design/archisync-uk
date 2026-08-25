import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Play, 
  Square, 
  Send, 
  BookOpen, 
  Languages, 
  Copy, 
  Check, 
  Trash2, 
  ArrowRightLeft,
  Info,
  Radio,
  Zap,
  HelpCircle,
  HardDrive,
  FolderDown,
  Save,
  CheckCircle2,
  Star,
  FileText,
  Sliders,
  Maximize2
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { 
  translateArchitectureText, 
  detectMeetingIntent, 
  detectSourceLanguage,
  saveLearnedCorrection,
  getLearnedStats,
  generateAiMeetingMinutes
} from '../services/geminiService';
import { findGlossaryMatches } from '../data/architectureGlossary';
import { DEMO_SCENARIOS } from '../data/demoScenarios';

// 🌐 Quick Test Phrases for Native Voice Simulation
const ukQuickPhrases = [
  "We need to review the structural steel column deflection at grid line B4.",
  "Let's confirm the double-glazed unit U-value for the curtain wall facade.",
  "The MEP plenum clearance on level 12 must comply with RIBA Stage 4."
];

const jpQuickPhrases = [
  "構造設計の柱の配筋ピッチについて確認をお願いします。",
  "カーテンウォールの熱貫流率計算書を提出してください。",
  "免震ピットの点検口寸法を修正する必要があります。"
];

const zhQuickPhrases = [
  "我们需要确认B4轴线处钢结构的挠度计算数据。",
  "请提供幕墙双层玻璃的传热系数U值检测报告。",
  "机电管线在12层的净高必须满足施工图设计规范。"
];

// 🏛️ Full Natural Sentence Splitter (Splits continuous speech streams into clean, complete full sentences)
function splitIntoSentences(text) {
  if (!text || typeof text !== 'string' || !text.trim()) return [];
  const raw = text.trim();

  // 1. Protect abbreviations like Dr., Mr., vs., e.g., i.e., 1.5m, etc.
  const protectedText = raw
    .replace(/(?<=\b(?:Dr|Mr|Ms|Prof|Rev|Fig|Ref|vs|etc|i\.e|e\.g))\./gi, '§DOT§')
    .replace(/(?<=\d)\.(?=\d)/g, '§DOT§');

  // 2. Split on sentence terminals (. ? ! \n)
  let rawSentences = protectedText
    .split(/(?<=[.?!;:\n])\s+|\n+/)
    .map(s => s.replace(/§DOT§/g, '.').trim())
    .filter(Boolean);

  // 3. Fallback: If no terminals and text is long (> 18 words), split on major discourse transitions
  if (rawSentences.length <= 1 && raw.split(/\s+/).length > 20) {
    rawSentences = raw
      .split(/(?<=[,])\s+(?=\b(?:and then|and also|so|however|therefore|in addition|furthermore|regarding|now let's|first of all)\b)/i)
      .map(s => s.trim())
      .filter(Boolean);
  }

  return rawSentences.length > 0 ? rawSentences : [raw];
}

// 🏛️ Translate Sentence-by-Sentence with 100% 1:1 Exact Alignment Guarantee
async function translateWithSentenceAlignment({ text, sourceLang, targetLang, apiKey }) {
  if (!text || !text.trim()) return { fullTranslation: '', pairs: [] };

  const sentences = splitIntoSentences(text);
  if (sentences.length <= 1) {
    const singleTrans = await translateArchitectureText({
      text: sentences[0] || text,
      sourceLang,
      targetLang,
      apiKey
    });
    return {
      fullTranslation: singleTrans,
      pairs: [{ orig: sentences[0] || text, trans: singleTrans }]
    };
  }

  // Translate each sentence individually to guarantee 100% strict 1:1 mapping
  const pairs = await Promise.all(
    sentences.map(async (origSentence) => {
      const transSentence = await translateArchitectureText({
        text: origSentence,
        sourceLang,
        targetLang,
        apiKey
      });
      return {
        orig: origSentence,
        trans: transSentence
      };
    })
  );

  const fullTranslation = pairs.map(p => p.trans).join(' ');
  return { fullTranslation, pairs };
}

// 💎 Commercial Grade 8pt High-Density Card with Crisp Contrast Alignment
const MessageCardItem = React.memo(function MessageCardItem({
  msg,
  isDark,
  isStarred,
  onToggleStar,
  copiedId,
  onCopy,
  onPlaySpeech,
  onOpenGlossary,
  editingId,
  editTranslationText,
  onStartEdit,
  onCancelEdit,
  onChangeEditText,
  onSaveEdit,
  splitRatio = 50,
  archiveFontSize = 8
}) {
  const isUK = msg.lang === 'en-GB' || msg.lang?.startsWith('en');
  const isZH = msg.lang?.startsWith('zh');
  const isJP = msg.lang?.startsWith('ja');
  const flag = isZH ? '🇨🇳' : isJP ? '🇯🇵' : isUK ? '🇬🇧' : '🇰🇷';

  // Dynamic grid column template matching the live stage split ratio
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `minmax(0, ${splitRatio}fr) minmax(0, ${100 - splitRatio}fr)`,
    gap: '0.625rem'
  };

  return (
    <div className={`w-full rounded-xl p-2.5 border transition-all ${
      isStarred
        ? isDark ? 'bg-amber-950/30 border-amber-500/60 text-slate-100 shadow-md' : 'bg-amber-50/80 border-amber-300 text-slate-900 shadow-xs'
        : isDark ? 'bg-slate-950/85 border-slate-800/80 text-slate-100 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-900 shadow-xs hover:border-slate-300'
    } space-y-1.5`}>
      
      {/* 1. Subtle Mini Meta Bar: Flag, Timestamp, Quick Action Dock */}
      <div className={`flex items-center justify-between pb-1 border-b text-[7.5pt] ${
        isDark ? 'border-slate-800/70 text-slate-400' : 'border-slate-100 text-slate-500'
      }`}>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onToggleStar(msg.id)}
            className={`p-0.5 rounded transition ${isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
            title={isStarred ? "중요 표시 해제" : "중요 발화로 북마크 고정"}
          >
            <Star className={`w-3 h-3 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
          <span>{flag}</span>
          <span className="font-mono text-slate-400">{msg.timestamp}</span>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => onPlaySpeech(msg.original, msg.lang)}
            className="px-1 py-0.5 hover:text-amber-400 text-slate-400 rounded transition flex items-center gap-0.5 text-[7.5pt]"
            title="원어민 음성 듣기"
          >
            <Volume2 className="w-3 h-3 text-amber-500" />
            <span>원문</span>
          </button>
          <button
            onClick={() => onPlaySpeech(msg.translation, isUK ? 'ko-KR' : 'en-GB')}
            className="px-1 py-0.5 hover:text-sky-400 text-slate-400 rounded transition flex items-center gap-0.5 text-[7.5pt]"
            title="한국어 통역 듣기"
          >
            <Volume2 className="w-3 h-3 text-sky-400" />
            <span>한글</span>
          </button>
          <button
            onClick={() => onStartEdit(msg.id, msg.translation)}
            className="px-1 py-0.5 hover:text-amber-400 text-slate-400 rounded transition text-[7.5pt]"
            title="오역 수정 및 AI 영구 학습"
          >
            ✏️
          </button>
          <button
            onClick={() => onCopy(msg.id, `[원문] ${msg.original}\n[한글] ${msg.translation}`)}
            className="p-0.5 hover:text-amber-500 rounded transition text-slate-400"
            title="대화 복사"
          >
            {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 2. Dual Column 1:1 Sentence-by-Sentence Parallel Comparison with Dynamic Archive Font Size */}
      <div className="space-y-1.5 leading-relaxed" style={{ fontSize: `${archiveFontSize}pt` }}>
        {editingId === msg.id ? (
          <div className="p-2.5 rounded-lg border bg-slate-900 border-amber-500/50 space-y-2">
            <textarea
              value={editTranslationText}
              onChange={(e) => onChangeEditText(e.target.value)}
              style={{ fontSize: `${archiveFontSize}pt` }}
              className="w-full p-2 rounded border bg-slate-950 border-slate-700 text-slate-100 font-sans"
              rows={3}
            />
            <div className="flex items-center justify-end space-x-2">
              <button onClick={onCancelEdit} className="px-2 py-1 text-[7.5pt] text-slate-400 hover:text-white">
                취소
              </button>
              <button
                onClick={() => onSaveEdit(msg.id, msg.original, editTranslationText)}
                className="px-3 py-1 text-[7.5pt] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded shadow-xs"
              >
                학습 저장
              </button>
            </div>
          </div>
        ) : (
          (() => {
            // 1. If message has pre-aligned pairs, render them directly (100% Guaranteed 1:1 Match)
            if (msg.pairs && Array.isArray(msg.pairs) && msg.pairs.length > 0) {
              return msg.pairs.map((pair, idx) => (
                <div 
                  key={idx} 
                  style={gridStyle}
                  className={`p-2 rounded-lg border transition ${
                    isDark 
                      ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-1.5 font-medium select-text min-w-0">
                    <span className="font-mono text-[7pt] text-amber-500/80 font-bold shrink-0 mt-0.5">[{idx + 1}]</span>
                    <p style={{ fontSize: `${archiveFontSize}pt` }} className={`leading-relaxed break-keep-all ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {pair.orig}
                    </p>
                  </div>
                  <div className="flex items-start gap-1.5 font-bold select-text min-w-0">
                    <span className="font-mono text-[7pt] text-indigo-400 font-bold shrink-0 mt-0.5">[{idx + 1}]</span>
                    <p style={{ fontSize: `${archiveFontSize}pt` }} className={`leading-relaxed break-keep-all ${isDark ? 'text-amber-300' : 'text-indigo-950'}`}>
                      {pair.trans}
                    </p>
                  </div>
                </div>
              ));
            }

            // 2. Fallback Alignment for legacy messages or external text
            const originalSentences = splitIntoSentences(msg.original || '');
            const translationSentences = splitIntoSentences(msg.translation || '');

            // If sentence counts match, display 1:1
            if (originalSentences.length === translationSentences.length) {
              return originalSentences.map((orig, idx) => (
                <div 
                  key={idx} 
                  style={gridStyle}
                  className={`p-2 rounded-lg border transition ${
                    isDark 
                      ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-1.5 font-medium select-text min-w-0">
                    <span className="font-mono text-[7pt] text-amber-500/80 font-bold shrink-0 mt-0.5">[{idx + 1}]</span>
                    <p style={{ fontSize: `${archiveFontSize}pt` }} className={`leading-relaxed break-keep-all ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {orig}
                    </p>
                  </div>
                  <div className="flex items-start gap-1.5 font-bold select-text min-w-0">
                    <span className="font-mono text-[7pt] text-indigo-400 font-bold shrink-0 mt-0.5">[{idx + 1}]</span>
                    <p style={{ fontSize: `${archiveFontSize}pt` }} className={`leading-relaxed break-keep-all ${isDark ? 'text-amber-300' : 'text-indigo-950'}`}>
                      {translationSentences[idx]}
                    </p>
                  </div>
                </div>
              ));
            }

            // If sentence counts differ, display as single cohesive matching block
            return (
              <div 
                style={gridStyle}
                className={`p-2 rounded-lg border transition ${
                  isDark 
                    ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-1.5 font-medium select-text min-w-0">
                  <span className="font-mono text-[7pt] text-amber-500/80 font-bold shrink-0 mt-0.5">[1]</span>
                  <p style={{ fontSize: `${archiveFontSize}pt` }} className={`leading-relaxed break-keep-all ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {msg.original}
                  </p>
                </div>
                <div className="flex items-start gap-1.5 font-bold select-text min-w-0">
                  <span className="font-mono text-[7pt] text-indigo-400 font-bold shrink-0 mt-0.5">[1]</span>
                  <p style={{ fontSize: `${archiveFontSize}pt` }} className={`leading-relaxed break-keep-all ${isDark ? 'text-amber-300' : 'text-indigo-950'}`}>
                    {msg.translation}
                  </p>
                </div>
              </div>
            );
          })()
        )}
      </div>

    </div>
  );
});

export default function LiveInterpreter({ 
  messages, 
  setMessages, 
  apiKey, 
  selectedScenarioId,
  onSelectedScenarioChange,
  onOpenGlossaryWithTerm,
  theme = 'dark'
}) {
  const isDark = theme === 'dark';
  const [activeMic, setActiveMic] = useState(null); // 'en-GB' | 'en-US' | 'ko-KR' | null
  const [selectedEnglishAccent, setSelectedEnglishAccent] = useState('en-GB'); // 'en-GB' | 'en-US'
  const [currentLiveOriginal, setCurrentLiveOriginal] = useState('');
  const [currentLiveTranslation, setCurrentLiveTranslation] = useState('');
  const [isLiveSpeaking, setIsLiveSpeaking] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [inputLang, setInputLang] = useState('en-GB');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [autoSpeakKorean, setAutoSpeakKorean] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { success, path, filename, visible }
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTranslationText, setEditTranslationText] = useState('');
  const [learnedCount, setLearnedCount] = useState(() => getLearnedStats().totalLearnedTerms);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [testLanguageTab, setTestLanguageTab] = useState('en-GB'); // 'en-GB' | 'ja-JP' | 'zh-CN'

  // 💎 Commercial SaaS Premium States (칸/박스별 독립 글자 크기 조절 상태)
  const [leftFontSize, setLeftFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem('archisync_font_left');
      return saved ? Math.min(24, Math.max(8, Number(saved))) : 12;
    } catch { return 12; }
  });

  const [rightFontSize, setRightFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem('archisync_font_right');
      return saved ? Math.min(24, Math.max(8, Number(saved))) : 12;
    } catch { return 12; }
  });

  const [archiveFontSize, setArchiveFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem('archisync_font_archive');
      return saved ? Math.min(16, Math.max(6, Number(saved))) : 8;
    } catch { return 8; }
  });

  const [isPipFloating, setIsPipFloating] = useState(false); // PiP Floating Subtitle Mode
  const [starredIds, setStarredIds] = useState(new Set()); // Starred Pins
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // 🎛️ Dynamic Resizing & Split Ratio States (사용자 칸 크기 조절 상태)
  const [splitRatio, setSplitRatio] = useState(() => {
    try {
      const saved = localStorage.getItem('archisync_split_ratio');
      return saved ? Math.min(80, Math.max(20, Number(saved))) : 50;
    } catch {
      return 50;
    }
  });

  const [stageHeight, setStageHeight] = useState(() => {
    try {
      const saved = localStorage.getItem('archisync_stage_height');
      return saved ? Math.min(850, Math.max(280, Number(saved))) : 510;
    } catch {
      return 510;
    }
  });

  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);
  const stageContainerRef = useRef(null);

  const messagesBottomRef = useRef(null);
  const liveLeftViewportRef = useRef(null);
  const liveRightViewportRef = useRef(null);
  const simulationTimerRef = useRef(null);
  const visualizerCleanupRef = useRef(null);
  const interimTranslateTimerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const isSpacePressedRef = useRef(false);

  // 📐 Horizontal Split Drag Handler (좌우 칸 너비 마우스 드래그 조절)
  const handleSplitDragStart = (e) => {
    e.preventDefault();
    setIsDraggingSplit(true);

    const onMouseMove = (moveEvent) => {
      if (!stageContainerRef.current) return;
      const rect = stageContainerRef.current.getBoundingClientRect();
      const clientX = moveEvent.clientX;
      const ratio = ((clientX - rect.left) / rect.width) * 100;
      const clampedRatio = Math.min(80, Math.max(20, Math.round(ratio)));
      setSplitRatio(clampedRatio);
      try {
        localStorage.setItem('archisync_split_ratio', clampedRatio);
      } catch {}
    };

    const onMouseUp = () => {
      setIsDraggingSplit(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // ↕️ Vertical Height Drag Handler (상단 무대 높이 마우스 드래그 조절)
  const handleHeightDragStart = (e) => {
    e.preventDefault();
    setIsDraggingHeight(true);
    const startY = e.clientY;
    const startHeight = stageHeight;

    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.min(850, Math.max(280, Math.round(startHeight + deltaY)));
      setStageHeight(newHeight);
      try {
        localStorage.setItem('archisync_stage_height', newHeight);
      } catch {}
    };

    const onMouseUp = () => {
      setIsDraggingHeight(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // 🔄 Reset Sizes to Default (기본 크기로 원터치 리셋)
  const handleResetSizes = () => {
    setSplitRatio(50);
    setStageHeight(510);
    try {
      localStorage.setItem('archisync_split_ratio', 50);
      localStorage.setItem('archisync_stage_height', 510);
    } catch {}
  };

  // 🔒 Auto-Scroll Viewports on Live Speech Stream (Keeps newest speech in view without overflowing box)
  useEffect(() => {
    if (liveLeftViewportRef.current) {
      liveLeftViewportRef.current.scrollTop = liveLeftViewportRef.current.scrollHeight;
    }
  }, [currentLiveOriginal]);

  useEffect(() => {
    if (liveRightViewportRef.current) {
      liveRightViewportRef.current.scrollTop = liveRightViewportRef.current.scrollHeight;
    }
  }, [currentLiveTranslation]);

  const sessionFilenameRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const [autoSavedTime, setAutoSavedTime] = useState(null);

  // 📜 Auto-Scroll Backup Archive to Bottom (Always displays newest finalized card at bottom matching live stage)
  useEffect(() => {
    if (messagesBottomRef.current) {
      messagesBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 💾 Real-time Auto-Save Engine: Automatically writes backup to Documents\음성 on every message
  useEffect(() => {
    if (messages.length === 0) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const scenario = DEMO_SCENARIOS.find(s => s.id === selectedScenarioId) || DEMO_SCENARIOS[0];
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');

        if (!sessionFilenameRef.current) {
          const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
          const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
          const cleanTitle = (scenario.title || 'ArchiSync_Live').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
          sessionFilenameRef.current = `${dateStr}_${timeStr}_${cleanTitle}_대화록.txt`;
        }

        const header = `=====================================================\n` +
                       `  ArchiSync UK 실시간 다국어 통역 자동 백업 대화록\n` +
                       `  프로젝트: ${scenario.title || 'Canary Wharf Mixed-Use Tower'}\n` +
                       `  저장일시: ${now.toLocaleString()}\n` +
                       `  총 대화 수: ${messages.length}건\n` +
                       `=====================================================\n\n`;

        const body = messages.map((m, idx) => {
          const sentences = splitIntoSentences(m.original || '');
          const transSentences = splitIntoSentences(m.translation || '');
          const maxL = Math.max(sentences.length, transSentences.length, 1);
          
          let rows = '';
          for (let i = 0; i < maxL; i++) {
            rows += `  [${i + 1}] 원문: ${sentences[i] || m.original || ''}\n` +
                    `      한글: ${transSentences[i] || m.translation || ''}\n`;
          }

          return `[${idx + 1}] [${m.timestamp || ''}] ${m.speaker || 'Speaker'} (${m.lang || 'en'})\n` +
                 rows +
                 `-----------------------------------------------------\n`;
        }).join('\n');

        await fetch('/api/save-transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: sessionFilenameRef.current,
            projectName: scenario.title,
            content: header + body
          })
        });

        setAutoSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.warn('Auto-save background notice:', err);
      }
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [messages, selectedScenarioId]);

  // ⌨️ Global Commercial Hotkeys (Spacebar Push-to-Talk, Ctrl+S Save)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in textarea or input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      // 1. Ctrl + S -> Immediate Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveToDocuments();
        return;
      }

      // 2. Spacebar -> Push-to-Talk Start
      if (e.code === 'Space' && !isSpacePressedRef.current && !activeMic) {
        e.preventDefault();
        isSpacePressedRef.current = true;
        toggleMic('en-GB');
      }
    };

    const handleKeyUp = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      // Spacebar -> Push-to-Talk Release & Finalize
      if (e.code === 'Space' && isSpacePressedRef.current) {
        e.preventDefault();
        isSpacePressedRef.current = false;
        if (activeMic) {
          toggleMic(activeMic);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeMic]);

  // ⭐ Toggle Starred Message
  const toggleStar = (id) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 🧠 AI One-Click Executive Summary & Action Items Generator
  const handleGenerateSummary = async () => {
    if (messages.length === 0) {
      alert('요약할 대화 내용이 없습니다. 먼저 마이크로 대화를 나누거나 테스트를 실행해주세요.');
      return;
    }
    setIsGeneratingSummary(true);
    setIsSummaryModalOpen(true);
    try {
      const currentScenario = DEMO_SCENARIOS.find(s => s.id === selectedScenarioId) || DEMO_SCENARIOS[0];
      const result = await generateAiMeetingMinutes({
        dialogueList: messages,
        projectInfo: {
          title: currentScenario.title || 'ArchiSync UK Architectural Conference',
          ribaStage: currentScenario.category || 'Stage 3 / Stage 4'
        },
        apiKey: apiKey
      });
      setSummaryData(result);
    } catch (e) {
      console.error('Summary generation error:', e);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // 🔴 Toggle Manual Voice Recording (ON / OFF)
  const toggleAudioRecording = async () => {
    if (isRecordingAudio) {
      // STOP recording
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      await speechService.stopMediaRecording();
      setIsRecordingAudio(false);
    } else {
      // START recording
      if (!speechService.mediaStream) {
        await speechService.startAudioVisualizer((lvl) => setAudioLevel(lvl));
      }
      speechService.startMediaRecording();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 🧠 Save and Learn User Correction in Real-Time
  const handleSaveCorrection = (msgId, originalText, newKorean) => {
    if (!newKorean.trim()) return;
    saveLearnedCorrection(originalText, newKorean.trim());
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, translation: newKorean.trim(), isLearned: true } : m));
    setEditingId(null);
    setLearnedCount(getLearnedStats().totalLearnedTerms);
  };

  // 💾 Handle Direct Saving to C:\Users\tttd1\Documents\음성
  const handleSaveToDocuments = async () => {
    setIsSaving(true);
    try {
      let audioBlob = null;
      if (isRecordingAudio) {
        audioBlob = await speechService.stopMediaRecording();
        setIsRecordingAudio(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      }
      
      const res = await speechService.saveVoiceRecordingToDocuments(audioBlob, messages);
      
      setSaveStatus({
        success: res.success,
        path: res.path || 'C:\\Users\\tttd1\\Documents\\음성',
        audioFile: res.audioFile,
        transcriptFile: res.transcriptFile,
        visible: true
      });

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setSaveStatus(prev => prev ? { ...prev, visible: false } : null);
      }, 5000);
    } catch (e) {
      console.error('Save error:', e);
      setSaveStatus({
        success: false,
        error: e.message,
        path: 'C:\\Users\\tttd1\\Documents\\음성',
        visible: true
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Audio level visualizer during active mic
  useEffect(() => {
    if (activeMic) {
      speechService.startAudioVisualizer((lvl) => {
        setAudioLevel(lvl);
      }).then(cleanup => {
        visualizerCleanupRef.current = cleanup;
      });
    } else {
      if (visualizerCleanupRef.current) {
        visualizerCleanupRef.current();
        visualizerCleanupRef.current = null;
      }
      setAudioLevel(0);
    }
  }, [activeMic]);

  // Start / Stop Microphone with Real-time Streaming Translation & Zero-Drop Guarantee
  const toggleMic = async (lang) => {
    if (activeMic === lang) {
      if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);
      
      // If there's pending interim text on stop, commit it immediately so no words are dropped
      if (interimText.trim()) {
        const pendingText = interimText.trim();
        const detectedLang = (lang === 'auto' || !lang) ? detectSourceLanguage(pendingText) : lang;
        const targetLang = 'ko-KR'; // Always translate to Korean for right HUD

        const { fullTranslation, pairs } = await translateWithSentenceAlignment({
          text: pendingText,
          sourceLang: detectedLang,
          targetLang: targetLang,
          apiKey: apiKey
        });
        const translated = fullTranslation;
        const matchedTerms = findGlossaryMatches(pendingText);
        const intent = detectMeetingIntent(pendingText, translated);

        const isZH = detectedLang.startsWith('zh');
        const isJP = detectedLang.startsWith('ja');
        const isEN = detectedLang.startsWith('en');

        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          speaker: isZH ? 'Shanghai Lead Architect' : isJP ? 'Tokyo Lead Architect' : isEN ? 'UK Lead Architect' : 'Seoul Design Lead',
          speakerRole: isZH ? 'CN Architect' : isJP ? 'JP Architect' : isEN ? 'UK Architect' : 'KR Director',
          lang: detectedLang,
          accent: isZH ? 'Chinese (Mandarin)' : isJP ? 'Japanese (Tokyo)' : detectedLang === 'en-GB' ? 'UK (London RP)' : detectedLang === 'en-US' ? 'US (General)' : 'Korean',
          original: pendingText,
          translation: translated,
          pairs: pairs,
          intent: intent,
          terms: matchedTerms.map(t => t.term),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }]);
      }

      speechService.stopRecognition();
      setActiveMic(null);
      setIsLiveSpeaking(false);
    } else {
      if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);
      speechService.stopRecognition();
      setActiveMic(lang);
      setInputLang(lang);
      
      const targetLang = 'ko-KR'; // Always translate to Korean for right HUD
      const sttLang = lang === 'auto' ? 'en-GB' : lang;

      speechService.startRecognition({
        lang: sttLang,
        continuous: true,
        onInterimResult: (streamText) => {
          setIsLiveSpeaking(true);
          setCurrentLiveOriginal(streamText);
          
          // 🚀 Smooth debounced translation preview (250ms) without CPU congestion
          if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);
          if (streamText.length > 2) {
            interimTranslateTimerRef.current = setTimeout(async () => {
              const detected = (lang === 'auto') ? detectSourceLanguage(streamText) : lang;
              const streamTrans = await translateArchitectureText({
                text: streamText,
                sourceLang: detected,
                targetLang: targetLang,
                apiKey: apiKey
              });
              setCurrentLiveTranslation(streamTrans);
            }, 250);
          }
        },
        onResult: async (finalText) => {
          if (!finalText.trim()) return;
          if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);

          setIsLiveSpeaking(false);
          const fullSentence = finalText.trim();
          setCurrentLiveOriginal(fullSentence);

          const detectedLang = (lang === 'auto') ? detectSourceLanguage(fullSentence) : lang;

          const { fullTranslation, pairs } = await translateWithSentenceAlignment({
            text: fullSentence,
            sourceLang: detectedLang,
            targetLang: targetLang,
            apiKey: apiKey
          });

          const translated = fullTranslation;
          setCurrentLiveTranslation(translated);

          const isZH = detectedLang.startsWith('zh');
          const isJP = detectedLang.startsWith('ja');
          const isEN = detectedLang.startsWith('en');

          const newMessage = {
            id: Date.now() + Math.random(),
            speaker: isZH ? 'Shanghai Lead Architect' : isJP ? 'Tokyo Lead Architect' : isEN ? 'UK Lead Architect' : 'Seoul Design Lead',
            speakerRole: isZH ? 'CN Architect' : isJP ? 'JP Architect' : isEN ? 'UK Architect' : 'KR Director',
            lang: detectedLang,
            accent: isZH ? 'Chinese (Mandarin)' : isJP ? 'Japanese (Tokyo)' : detectedLang === 'en-GB' ? 'UK (London RP)' : detectedLang === 'en-US' ? 'US (General)' : 'Korean',
            original: fullSentence,
            translation: translated,
            pairs: pairs,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };

          // ⚡ 3~4 Sentence Block Archiving Engine (Chronological Order: Newest at Bottom)
          const currentSentences = splitIntoSentences(fullSentence);
          const currentTransSentences = splitIntoSentences(translated);

          setMessages(prev => {
            if (prev.length > 0) {
              const lastIdx = prev.length - 1;
              const last = prev[lastIdx];
              const lastSentences = splitIntoSentences(last.original);

              // 1. If last card already has 3~4 sentences and current speech has grown beyond that,
              // let the first 3~4 sentences stay in previous card and append a new card at the BOTTOM
              if (lastSentences.length >= 3 && currentSentences.length > lastSentences.length) {
                const newSliceOrig = currentSentences.slice(lastSentences.length).join(' ');
                const newSliceTrans = currentTransSentences.slice(lastSentences.length).join(' ') || translated;

                if (newSliceOrig.trim()) {
                  const continuationCard = {
                    ...newMessage,
                    id: Date.now() + Math.random(),
                    original: newSliceOrig,
                    translation: newSliceTrans,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  };
                  return [...prev, continuationCard];
                }
              }

              // 2. Otherwise, update the LAST card at the bottom in-place
              const normalize = (t) => t.toLowerCase().replace(/[^a-z0-9가-힣\s]/g, '').replace(/\s+/g, ' ').trim();
              const normCurrent = normalize(fullSentence);
              const normLast = normalize(last.original);

              if (normCurrent === normLast) return prev;

              const isSameSpeechBlock = 
                normCurrent.startsWith(normLast) || 
                normLast.startsWith(normCurrent) ||
                normCurrent.includes(normLast) ||
                normLast.includes(normCurrent);

              if (isSameSpeechBlock) {
                const updated = {
                  ...last,
                  original: fullSentence.length >= last.original.length ? fullSentence : last.original,
                  translation: translated.length >= last.translation.length ? translated : last.translation,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                };
                return [...prev.slice(0, lastIdx), updated];
              }
            }

            return [...prev, newMessage];
          });

          // Auto speak translation if enabled
          if (autoSpeakKorean && targetLang === 'ko-KR') {
            speechService.speak(translated, 'ko-KR');
          }
        },
        onError: (error) => {
          console.warn('Speech Recognition error:', error);
          setActiveMic(null);
          setIsLiveSpeaking(false);
        }
      });
    }
  };

  // Handle Manual Text Submission
  const handleManualSend = async (e) => {
    e?.preventDefault();
    if (!customInput.trim()) return;

    const textToSend = customInput.trim();
    setCustomInput('');

    const detectedLang = (inputLang === 'auto') ? detectSourceLanguage(textToSend) : inputLang;
    const targetLang = 'ko-KR';

    const { fullTranslation, pairs } = await translateWithSentenceAlignment({
      text: textToSend,
      sourceLang: detectedLang,
      targetLang: targetLang,
      apiKey: apiKey
    });

    const translated = fullTranslation;
    const isZH = detectedLang.startsWith('zh');
    const isJP = detectedLang.startsWith('ja');
    const isEN = detectedLang.startsWith('en');

    const newMessage = {
      id: Date.now() + Math.random(),
      speaker: isZH ? 'Shanghai Lead Architect' : isJP ? 'Tokyo Lead Architect' : isEN ? 'UK Lead Architect' : 'Seoul Design Lead',
      speakerRole: isZH ? 'CN Architect' : isJP ? 'JP Architect' : isEN ? 'UK Architect' : 'KR Director',
      lang: detectedLang,
      accent: isZH ? 'Chinese (Mandarin)' : isJP ? 'Japanese (Tokyo)' : detectedLang === 'en-GB' ? 'UK (London RP)' : detectedLang === 'en-US' ? 'US (General)' : 'Korean',
      original: textToSend,
      translation: translated,
      pairs: pairs,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
  };

  // Play Speech
  const playSpeech = (text, lang) => {
    speechService.speak(text, lang);
  };

  // Copy to clipboard
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simulation Demo Engine
  const currentScenario = DEMO_SCENARIOS.find(s => s.id === selectedScenarioId) || DEMO_SCENARIOS[0];

  const startSimulation = () => {
    if (isSimulating) {
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
      speechService.stopSpeaking();
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);
    setMessages([]);
    setSimulationIndex(0);
    playNextSimulationStep(0);
  };

  const playNextSimulationStep = (idx) => {
    if (idx >= currentScenario.dialogue.length) {
      setIsSimulating(false);
      return;
    }

    const item = currentScenario.dialogue[idx];
    setSimulationIndex(idx);

    speechService.speak(item.original, item.lang, {
      onEnd: () => {
        const itemIntent = detectMeetingIntent(item.original, item.translation);
        setCurrentLiveOriginal(item.original);
        setCurrentLiveTranslation(item.translation);
        setMessages(prev => [...prev, {
          ...item,
          id: Date.now() + idx,
          intent: itemIntent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }]);

        setTimeout(() => {
          const targetLang = item.lang === 'en-GB' ? 'ko-KR' : 'en-GB';
          if (autoSpeakKorean && targetLang === 'ko-KR') {
            speechService.speak(item.translation, 'ko-KR', {
              onEnd: () => {
                simulationTimerRef.current = setTimeout(() => {
                  playNextSimulationStep(idx + 1);
                }, 1200);
              }
            });
          } else {
            simulationTimerRef.current = setTimeout(() => {
              playNextSimulationStep(idx + 1);
            }, 1800);
          }
        }, 500);
      }
    });
  };

  // One-touch Native Voice Test (UK English / Japanese / Chinese)
  const runVoiceTest = async (testSentence, lang = 'en-GB') => {
    // 1. Speak in native voice (UK English / Japanese / Chinese)
    speechService.speak(testSentence, lang);
    setCurrentLiveOriginal(testSentence);

    // 2. Immediately translate to Korean (Always Korean for right HUD!)
    const targetLang = 'ko-KR';
    const { fullTranslation, pairs } = await translateWithSentenceAlignment({
      text: testSentence,
      sourceLang: lang,
      targetLang: targetLang,
      apiKey: apiKey
    });

    const translated = fullTranslation;
    setCurrentLiveTranslation(translated);
    const matchedTerms = findGlossaryMatches(testSentence);
    const intent = detectMeetingIntent(testSentence, translated);

    const isJP = lang.startsWith('ja');
    const isZH = lang.startsWith('zh');

    setMessages(prev => [...prev, {
      id: Date.now(),
      speaker: isZH ? 'Shanghai Lead Architect (Xiaoxiao)' : isJP ? 'Tokyo Lead Architect (Haruka)' : 'UK Lead Architect (Oliver)',
      speakerRole: isZH ? 'CN Architect' : isJP ? 'JP Architect' : 'UK Architect',
      lang: lang,
      accent: isZH ? 'Chinese (Mandarin)' : isJP ? 'Japanese (Tokyo)' : 'UK (London RP)',
      original: testSentence,
      translation: translated,
      pairs: pairs,
      intent: intent,
      terms: matchedTerms.map(t => t.term),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }]);

    if (autoSpeakKorean) {
      setTimeout(() => {
        speechService.speak(translated, 'ko-KR');
      }, 1500);
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(simulationTimerRef.current);
      speechService.stopSpeaking();
      speechService.stopRecognition();
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 gap-2.5">
      
      {/* 🚀 CENTRAL LIVE REAL-TIME STAGE (Sleek Minimalist HUD) */}
      <div className={`${
        isDark 
          ? 'bg-slate-900/90 border border-slate-800/80 text-white shadow-sm' 
          : 'bg-white border border-slate-200 text-slate-900 shadow-xs'
      } rounded-2xl p-4 transition-colors`}>
        
        {/* HUD Top Bar */}
        <div className={`flex flex-wrap items-center justify-between pb-2.5 mb-3 border-b ${
          isDark ? 'border-slate-800/80' : 'border-slate-100'
        } gap-2`}>
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-3 w-3">
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                activeMic ? 'bg-amber-500 shadow-sm shadow-amber-400/50' : 'bg-emerald-500'
              }`} />
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black tracking-tight flex items-center gap-1.5 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <Zap className="w-4 h-4 text-amber-500 fill-current" />
                <span>실시간 통역 메인 HUD</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-800 border border-amber-300'
              }`}>
                🇬🇧·🇯🇵·🇨🇳 ➔ 🇰🇷 0.03s 즉시 통역
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                (⌨️ Space 누른 채 발화)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* 🎛️ Dynamic Split Ratio & Height Presets (칸 사이즈 조절 독) */}
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-bold ${
              isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
            }`}>
              <span className="text-[7.5pt] opacity-70">📐칸:</span>
              <button
                onClick={() => { setSplitRatio(50); try { localStorage.setItem('archisync_split_ratio', 50); } catch {} }}
                className={`px-1.5 py-0.5 rounded text-[7.5pt] font-mono transition ${splitRatio === 50 ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-amber-400'}`}
                title="5:5 균등 분할"
              >
                5:5
              </button>
              <button
                onClick={() => { setSplitRatio(40); try { localStorage.setItem('archisync_split_ratio', 40); } catch {} }}
                className={`px-1.5 py-0.5 rounded text-[7.5pt] font-mono transition ${splitRatio === 40 ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-amber-400'}`}
                title="4:6 (한글 통역 확대)"
              >
                4:6
              </button>
              <button
                onClick={() => { setSplitRatio(60); try { localStorage.setItem('archisync_split_ratio', 60); } catch {} }}
                className={`px-1.5 py-0.5 rounded text-[7.5pt] font-mono transition ${splitRatio === 60 ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-amber-400'}`}
                title="6:4 (원문 발화 확대)"
              >
                6:4
              </button>
              <span className="text-slate-600 dark:text-slate-700">|</span>
              <button
                onClick={() => { setStageHeight(380); try { localStorage.setItem('archisync_stage_height', 380); } catch {} }}
                className={`px-1.5 py-0.5 rounded text-[7.5pt] font-mono transition ${stageHeight === 380 ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-amber-400'}`}
                title="무대 높이 축소 (380px)"
              >
                ↕S
              </button>
              <button
                onClick={() => { setStageHeight(510); try { localStorage.setItem('archisync_stage_height', 510); } catch {} }}
                className={`px-1.5 py-0.5 rounded text-[7.5pt] font-mono transition ${stageHeight === 510 ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-amber-400'}`}
                title="무대 높이 표준 (510px)"
              >
                ↕M
              </button>
              <button
                onClick={() => { setStageHeight(650); try { localStorage.setItem('archisync_stage_height', 650); } catch {} }}
                className={`px-1.5 py-0.5 rounded text-[7.5pt] font-mono transition ${stageHeight === 650 ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-amber-400'}`}
                title="무대 높이 확대 (650px)"
              >
                ↕L
              </button>
            </div>

            {/* 🧠 AI 3줄 요약 & 회의록 생성 버튼 */}
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition border border-amber-300"
              title="현재 회의 내용을 분석하여 3줄 요약, 주요 결정사항, Action Items를 자동 생성합니다"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{isGeneratingSummary ? 'AI 분석 중...' : '⚡ AI 회의록'}</span>
            </button>

            {/* 🔴 Manual Audio Recording Toggle Button (Default: OFF) */}
            <button
              onClick={toggleAudioRecording}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                isRecordingAudio
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400 ring-2 ring-rose-500/30 animate-pulse'
                  : isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
              }`}
              title={isRecordingAudio ? "음성 녹음 중지" : "음성 녹음 시작 (필요 시 클릭하여 켬)"}
            >
              <span className={`w-2 h-2 rounded-full ${isRecordingAudio ? 'bg-white animate-ping' : 'bg-slate-400'}`} />
              <span>
                {isRecordingAudio 
                  ? `● REC 녹음 중 (${formatTime(recordingSeconds)})` 
                  : '⚪ 음성 녹음 (기본 OFF)'}
              </span>
            </button>

            <label className={`flex items-center space-x-1.5 text-xs font-bold cursor-pointer px-2.5 py-1 rounded-lg border transition ${
              isDark 
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-500/40' 
                : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 shadow-xs'
            }`}>
              <input
                type="checkbox"
                checked={autoSpeakKorean}
                onChange={(e) => setAutoSpeakKorean(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 w-3.5 h-3.5"
              />
              <span className="flex items-center gap-1 text-xs">
                <Volume2 className="w-3.5 h-3.5 text-amber-500" /> 한글 음성(TTS)
              </span>
            </label>
          </div>
        </div>

        {/* 🌟 CENTRAL LIVE REAL-TIME STAGE (Dynamic Split & Height Resizable Viewport) */}
        <div 
          ref={stageContainerRef}
          style={{ minHeight: `${stageHeight}px` }}
          className="flex flex-col md:flex-row items-stretch relative transition-all"
        >
          
          {/* ⬅️ LEFT SCREEN: Live Spoken Foreign Speech (Dynamic Resizable Width & Height) */}
          <div 
            style={{ 
              width: window.innerWidth >= 768 ? `calc(${splitRatio}% - 6px)` : '100%',
              height: `${stageHeight}px`, 
              maxHeight: `${stageHeight}px` 
            }}
            className={`${
              isDark 
                ? 'bg-slate-950/90 border border-slate-800 text-slate-100' 
                : 'bg-slate-50 border border-slate-200 text-slate-900 shadow-xs'
            } p-4 rounded-xl flex flex-col justify-between transition-all relative overflow-hidden shrink-0 min-w-0`}
          >
            
            {/* Header: Fixed Height (h-8) with Dedicated Left Font Size Zoom */}
            <div className={`flex items-center justify-between pb-2.5 border-b shrink-0 h-8 ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <span className="text-[11pt] font-black text-amber-500 flex items-center gap-2 truncate">
                {activeMic === 'auto' ? (
                  <>⚡ 🌐 자동 언어 감지 ({
                    interimText ? (
                      detectSourceLanguage(interimText) === 'zh-CN' ? '🇨🇳 중국어 감지' :
                      detectSourceLanguage(interimText) === 'ja-JP' ? '🇯🇵 일본어 감지' :
                      detectSourceLanguage(interimText) === 'ko-KR' ? '🇰🇷 한국어 감지' : '🇬🇧/🇺🇸 영어 감지'
                    ) : messages[messages.length - 1]?.lang ? (
                      messages[messages.length - 1].lang.startsWith('zh') ? '🇨🇳 중국어' :
                      messages[messages.length - 1].lang.startsWith('ja') ? '🇯🇵 일본어' :
                      messages[messages.length - 1].lang.startsWith('ko') ? '🇰🇷 한국어' : '🇬🇧/🇺🇸 영어'
                    ) : '음성 대기 중'
                  })</>
                ) : activeMic === 'zh-CN' || messages[messages.length - 1]?.lang?.startsWith('zh') ? (
                  <>🇨🇳 실시간 중국어 발화 (Live Chinese)</>
                ) : activeMic === 'ja-JP' || messages[messages.length - 1]?.lang?.startsWith('ja') ? (
                  <>🇯🇵 실시간 일본어 발화 (Live Japanese)</>
                ) : activeMic === 'ko-KR' || messages[messages.length - 1]?.lang?.startsWith('ko') ? (
                  <>🇰🇷 실시간 한국어 발화 (Live Korean)</>
                ) : (
                  <>🇬🇧/🇺🇸 실시간 영어 발화 (Live English)</>
                )}
              </span>

              <div className="flex items-center space-x-1.5 shrink-0">
                {/* 🎛️ Left Box Dedicated Font Zoom (A- / A+) */}
                <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border text-[7.5pt] font-mono ${
                  isDark ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-white text-slate-800 border-slate-200 shadow-xs'
                }`}>
                  <span className="opacity-70">글자:</span>
                  <button 
                    onClick={() => {
                      const next = Math.max(8, leftFontSize - 1);
                      setLeftFontSize(next);
                      try { localStorage.setItem('archisync_font_left', next); } catch {}
                    }}
                    className="hover:text-amber-400 font-bold px-0.5"
                    title="원문 글자 크기 축소"
                  >
                    A-
                  </button>
                  <span className="font-bold text-amber-400">{leftFontSize}pt</span>
                  <button 
                    onClick={() => {
                      const next = Math.min(24, leftFontSize + 1);
                      setLeftFontSize(next);
                      try { localStorage.setItem('archisync_font_left', next); } catch {}
                    }}
                    className="hover:text-amber-400 font-bold px-0.5"
                    title="원문 글자 크기 확대"
                  >
                    A+
                  </button>
                </div>

                <span className={`text-[8.5pt] font-mono font-bold px-2 py-0.5 rounded-full ${
                  activeMic 
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 animate-pulse' 
                    : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  {activeMic === 'auto' 
                    ? '🎙️ 🌐 자동감지' 
                    : activeMic ? `🎙️ ${activeMic === 'zh-CN' ? '중국어' : activeMic === 'ja-JP' ? '일본어' : activeMic.startsWith('en') ? '영어' : '한국어'}` : '마이크 대기'}
                </span>
              </div>
            </div>
            
            {/* Scrollable Fixed Text Viewport (overflow-y-auto) with leftFontSize */}
            <div 
              ref={liveLeftViewportRef}
              className="flex-1 my-3 overflow-y-auto pr-2 select-text scrollbar-thin scrollbar-thumb-slate-700 space-y-3"
            >
              <div 
                style={{ fontSize: `${leftFontSize}pt` }}
                className={`font-semibold leading-relaxed font-sans break-keep-all ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                {currentLiveOriginal ? (
                  <div className="space-y-2.5">
                    {splitIntoSentences(currentLiveOriginal).map((sentence, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-[8pt] text-amber-500/80 font-bold shrink-0 mt-0.5">[{idx + 1}]</span>
                        <p className={`leading-relaxed ${isLiveSpeaking ? 'text-white drop-shadow-sm' : ''}`}>
                          {sentence}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'} font-normal italic`}>
                    외국어(영·일·중) 음성을 실시간 수신합니다. (하단 마이크 또는 Spacebar 키 클릭)
                  </p>
                )}
              </div>
            </div>

            {/* Footer: Fixed Height (h-7) */}
            <div className={`pt-2 border-t shrink-0 h-7 ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'} text-[8.5pt] font-medium flex items-center justify-between`}>
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeMic ? 'bg-amber-500 animate-ping' : isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                <span className="truncate">원문 {leftFontSize}pt · 너비 {splitRatio}% · 높이 {stageHeight}px</span>
              </span>
              {isLiveSpeaking && (
                <span className="text-amber-500 font-mono text-[8pt] shrink-0 animate-pulse">Live Transcribing...</span>
              )}
            </div>
          </div>

          {/* ↔️ Central Horizontal Split Resizer Handle (마우스 좌우 드래그 바) */}
          <div
            onMouseDown={handleSplitDragStart}
            onDoubleClick={handleResetSizes}
            className={`hidden md:flex w-3 mx-0.5 my-auto h-[94%] rounded-full cursor-col-resize items-center justify-center transition-all group shrink-0 select-none ${
              isDraggingSplit 
                ? 'bg-amber-500 shadow-md shadow-amber-500/50 scale-110' 
                : isDark ? 'hover:bg-slate-700/80 bg-transparent' : 'hover:bg-slate-300/80 bg-transparent'
            }`}
            title="좌우로 드래그하여 칸 너비를 조절하세요 (더블클릭 시 5:5 리셋)"
          >
            <div className={`w-1 h-8 rounded-full transition-all ${
              isDraggingSplit ? 'bg-slate-950 h-12' : isDark ? 'bg-slate-700 group-hover:bg-amber-400 group-hover:h-12' : 'bg-slate-300 group-hover:bg-amber-500 group-hover:h-12'
            }`} />
          </div>

          {/* ➡️ RIGHT SCREEN: Live Instant Korean Translation (Dynamic Resizable Width & Height) */}
          <div 
            style={{ 
              width: window.innerWidth >= 768 ? `calc(${100 - splitRatio}% - 6px)` : '100%',
              height: `${stageHeight}px`, 
              maxHeight: `${stageHeight}px` 
            }}
            className={`${
              isDark 
                ? 'bg-indigo-950/40 border border-indigo-500/30 text-amber-300' 
                : 'bg-indigo-50/70 border border-indigo-200 text-indigo-950 shadow-xs'
            } p-4 rounded-xl flex flex-col justify-between transition-all relative overflow-hidden shrink-0 min-w-0`}
          >
            
            {/* Header: Fixed Height (h-8) with Dedicated Right Font Size Zoom */}
            <div className={`flex items-center justify-between pb-2.5 border-b shrink-0 h-8 ${
              isDark ? 'border-indigo-500/30' : 'border-indigo-200'
            }`}>
              <span className={`text-[11pt] font-black flex items-center gap-1.5 truncate ${
                isDark ? 'text-sky-300' : 'text-indigo-700'
              }`}>
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" /> 🇰🇷 실시간 한글 통역 (100% 한글)
              </span>

              <div className="flex items-center space-x-1.5 shrink-0">
                {/* 🎛️ Right Box Dedicated Font Zoom (A- / A+) */}
                <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border text-[7.5pt] font-mono ${
                  isDark ? 'bg-indigo-950/80 text-sky-200 border-indigo-500/40' : 'bg-white text-indigo-900 border-indigo-200 shadow-xs'
                }`}>
                  <span className="opacity-70">글자:</span>
                  <button 
                    onClick={() => {
                      const next = Math.max(8, rightFontSize - 1);
                      setRightFontSize(next);
                      try { localStorage.setItem('archisync_font_right', next); } catch {}
                    }}
                    className="hover:text-amber-300 font-bold px-0.5"
                    title="한글 통역 글자 크기 축소"
                  >
                    A-
                  </button>
                  <span className="font-bold text-amber-300">{rightFontSize}pt</span>
                  <button 
                    onClick={() => {
                      const next = Math.min(24, rightFontSize + 1);
                      setRightFontSize(next);
                      try { localStorage.setItem('archisync_font_right', next); } catch {}
                    }}
                    className="hover:text-amber-300 font-bold px-0.5"
                    title="한글 통역 글자 크기 확대"
                  >
                    A+
                  </button>
                </div>

                <span className={`text-[8.5pt] font-bold px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  ⚡ 0.03s
                </span>
              </div>
            </div>

            {/* Scrollable Fixed Text Viewport (overflow-y-auto) with rightFontSize */}
            <div 
              ref={liveRightViewportRef}
              className="flex-1 my-3 overflow-y-auto pr-2 select-text scrollbar-thin scrollbar-thumb-indigo-700 space-y-3"
            >
              <div 
                style={{ fontSize: `${rightFontSize}pt` }}
                className={`font-bold leading-relaxed break-keep-all ${
                  isDark ? 'text-amber-300' : 'text-indigo-950'
                }`}
              >
                {currentLiveTranslation ? (
                  <div className="space-y-2.5">
                    {splitIntoSentences(currentLiveTranslation).map((sentence, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-[8pt] text-indigo-400 font-bold shrink-0 mt-0.5">[{idx + 1}]</span>
                        <p className="font-extrabold leading-relaxed text-amber-300">
                          {sentence}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-normal`}>
                    외국어(영·일·중)로 말하면 우측에 {rightFontSize}pt 크기의 한국어 번역이 100% 실시간으로 표시됩니다.
                  </p>
                )}
              </div>
            </div>

            {/* Footer: Fixed Height (h-7) */}
            <div className={`pt-2 border-t shrink-0 h-7 ${isDark ? 'border-indigo-500/30 text-indigo-300/80' : 'border-indigo-100 text-indigo-700'} text-[8.5pt] font-medium flex items-center justify-between`}>
              <span className="truncate">한글 {rightFontSize}pt · 너비 {100 - splitRatio}% · 높이 {stageHeight}px</span>
              <span className="font-bold text-amber-400 shrink-0">100% 무조건 한글 출력</span>
            </div>
          </div>

        </div>

        {/* ↕️ Bottom Vertical Height Resizer Handle (마우스 상하 드래그 바) */}
        <div
          onMouseDown={handleHeightDragStart}
          onDoubleClick={handleResetSizes}
          className={`w-full h-3 mt-1 rounded-lg cursor-row-resize flex items-center justify-center transition-all group select-none ${
            isDraggingHeight 
              ? 'bg-amber-500/30 ring-1 ring-amber-400' 
              : isDark ? 'hover:bg-slate-800/80' : 'hover:bg-slate-100'
          }`}
          title="위아래로 드래그하여 무대 높이를 조절하세요 (더블클릭 시 510px 리셋)"
        >
          <div className={`w-16 h-1 rounded-full transition-all ${
            isDraggingHeight ? 'bg-amber-400 w-24' : isDark ? 'bg-slate-700 group-hover:bg-amber-400 group-hover:w-24' : 'bg-slate-300 group-hover:bg-amber-500 group-hover:w-24'
          }`} />
        </div>
      </div>

      {/* 💾 Save Notification Toast Banner */}
      {saveStatus && saveStatus.visible && (
        <div className={`${
          isDark ? 'bg-emerald-950/90 border-2 border-emerald-500 text-emerald-100' : 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900'
        } rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 transition-all animate-bounce`}>
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs md:text-sm font-bold">
                📁 내 컴퓨터 [내문서\음성] 폴더에 음성 및 대화록 저장이 완료되었습니다!
              </p>
              <p className="text-[11px] opacity-80 font-mono mt-0.5">
                저장 경로: {saveStatus.path} {saveStatus.audioFile ? `(${saveStatus.audioFile})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSaveStatus(null)}
            className={`text-xs font-bold px-2 py-1 rounded-lg transition ${
              isDark ? 'text-emerald-400 hover:text-white bg-emerald-900/80' : 'text-emerald-800 hover:text-white bg-emerald-200'
            }`}
          >
            닫기
          </button>
        </div>
      )}

      {/* Quick Voice Test & 💾 Voice Save Ribbon */}
      <div className={`${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-xs'
      } border rounded-xl px-3 py-1.5 shadow-sm flex flex-wrap items-center justify-between gap-2 text-[8.5pt]`}>
        
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5">
          {/* Language Test Switcher Tab (🇬🇧 UK / 🇯🇵 JP / 🇨🇳 CN) */}
          <div className={`flex items-center p-0.5 rounded-lg border shrink-0 ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              onClick={() => setTestLanguageTab('en-GB')}
              className={`px-2 py-0.5 text-[8pt] font-bold rounded transition ${
                testLanguageTab === 'en-GB'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇬🇧 영문
            </button>
            <button
              onClick={() => setTestLanguageTab('ja-JP')}
              className={`px-2 py-0.5 text-[8pt] font-bold rounded transition ${
                testLanguageTab === 'ja-JP'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇯🇵 일어
            </button>
            <button
              onClick={() => setTestLanguageTab('zh-CN')}
              className={`px-2 py-0.5 text-[8pt] font-bold rounded transition ${
                testLanguageTab === 'zh-CN'
                  ? 'bg-red-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇨🇳 중어
            </button>
          </div>

          <span className="text-[8pt] font-bold text-amber-500 shrink-0">
            ⚡ 퀵 테스트:
          </span>

          {(testLanguageTab === 'en-GB' ? ukQuickPhrases : testLanguageTab === 'ja-JP' ? jpQuickPhrases : zhQuickPhrases).slice(0, 2).map((phrase, i) => (
            <button
              key={i}
              onClick={() => runVoiceTest(phrase, testLanguageTab)}
              className={`text-[8pt] font-semibold px-2 py-0.5 rounded-lg border whitespace-nowrap transition flex items-center gap-1 ${
                isDark 
                  ? 'bg-slate-900/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border-slate-700 hover:border-amber-500/40' 
                  : 'bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border-slate-200 hover:border-amber-400'
              }`}
              title="클릭 시 원어민 음성 재생 및 실시간 한글 통역"
            >
              <Play className="w-2 h-2 fill-current text-amber-500" />
              <span>{phrase.slice(0, 22)}...</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* 💾 Direct Save Button into Documents\음성 */}
          <button
            onClick={handleSaveToDocuments}
            disabled={isSaving}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[8pt] font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition border border-indigo-400/40"
            title="현재까지의 녹음 음성과 번역 대화록을 내 컴퓨터 [내문서\음성] 폴더에 즉시 저장합니다"
          >
            <FolderDown className="w-3 h-3 text-sky-300" />
            <span>{isSaving ? '저장 중...' : '💾 내문서\\음성 저장'}</span>
          </button>

          <button
            onClick={() => { setMessages([]); setInterimText(''); setLiveStreamingTranslation(''); }}
            className={`p-1 rounded-lg transition border text-slate-400 hover:text-rose-400 ${
              isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-100 border-slate-300'
            }`}
            title="기록 초기화"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* 📜 SESSION BACKUP HISTORY ARCHIVE (Ultra-Compact High-Density 8pt Log) */}
      <div className={`flex-1 ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
      } border rounded-xl p-2 overflow-y-auto space-y-1.5 shadow-inner`}>
        {/* Section Title for Backup Archive */}
        <div className={`flex items-center justify-between pb-1 border-b text-[8.5pt] ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <div className="flex items-center space-x-1.5 font-bold">
            <BookOpen className={`w-3 h-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              이전 대화 백업 아카이브
            </span>
            <span className={`px-1.5 py-0.1 rounded-full text-[7.5pt] font-mono ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {messages.length}건
            </span>
            {autoSavedTime && (
              <span className={`px-2 py-0.5 rounded-full text-[7pt] font-mono flex items-center gap-1 ${
                isDark ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`} title="대화가 생길 때마다 내문서\음성 폴더에 자동으로 최신 내용이 실시간 저장됩니다">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                <span>자동저장됨 ({autoSavedTime})</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            {/* 🎛️ Archive Box Dedicated Font Zoom (A- / A+) */}
            <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border text-[7.5pt] font-mono ${
              isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-800 border-slate-300 shadow-xs'
            }`}>
              <span className="opacity-70">글자:</span>
              <button 
                onClick={() => {
                  const next = Math.max(6, archiveFontSize - 1);
                  setArchiveFontSize(next);
                  try { localStorage.setItem('archisync_font_archive', next); } catch {}
                }}
                className="hover:text-amber-400 font-bold px-0.5"
                title="아카이브 글자 크기 축소"
              >
                A-
              </button>
              <span className="font-bold text-amber-400">{archiveFontSize}pt</span>
              <button 
                onClick={() => {
                  const next = Math.min(16, archiveFontSize + 1);
                  setArchiveFontSize(next);
                  try { localStorage.setItem('archisync_font_archive', next); } catch {}
                }}
                className="hover:text-amber-400 font-bold px-0.5"
                title="아카이브 글자 크기 확대"
              >
                A+
              </button>
            </div>

            <button
              onClick={handleSaveToDocuments}
              className={`text-[8pt] font-bold flex items-center gap-1 px-2 py-0.5 rounded border transition ${
                isDark 
                  ? 'text-sky-400 hover:text-sky-300 bg-slate-800/80 border-slate-700 hover:border-sky-500/40' 
                  : 'text-sky-700 hover:text-sky-800 bg-white border-slate-300 hover:border-sky-400 shadow-xs'
              }`}
              title="이전 대화와 음성을 내문서\음성 폴더에 즉시 수동 저장"
            >
              <Save className="w-2.5 h-2.5 text-sky-500" />
              <span>즉시 저장</span>
            </button>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="h-16 flex items-center justify-center text-center p-2 space-x-2 text-slate-500">
            <Languages className="w-4 h-4 text-amber-500" />
            <span className="text-[8pt]">
              발화 완료 시 이곳에 {archiveFontSize}pt 고밀도로 차곡차곡 백업됩니다.
            </span>
          </div>
        )}

        {/* Previous Message Backup Cards (Memoized Pure Component for 0% Re-render CPU Overhead) */}
        {messages.map((msg) => (
          <MessageCardItem
            key={msg.id}
            msg={msg}
            isDark={isDark}
            isStarred={starredIds.has(msg.id)}
            onToggleStar={toggleStar}
            copiedId={copiedId}
            onCopy={handleCopy}
            onPlaySpeech={playSpeech}
            onOpenGlossary={onOpenGlossaryWithTerm}
            editingId={editingId}
            editTranslationText={editTranslationText}
            onStartEdit={(id, text) => {
              setEditingId(editingId === id ? null : id);
              setEditTranslationText(text);
            }}
            onCancelEdit={() => setEditingId(null)}
            onChangeEditText={setEditTranslationText}
            onSaveEdit={handleSaveCorrection}
            splitRatio={splitRatio}
            archiveFontSize={archiveFontSize}
          />
        ))}
        <div ref={messagesBottomRef} />
      </div>

      {/* Bottom Microphone & Text Input Dock */}
      <div className={`${
        isDark ? 'bg-slate-800/90 border-slate-700/90' : 'bg-white border-slate-200 shadow-xl'
      } border rounded-2xl p-3 shadow-2xl backdrop-blur-md transition-colors`}>
        
        {/* Audio Wave Visualizer (GPU/CSS Transform Accelerated) */}
        {activeMic && (
          <div className="mb-2 px-2 flex items-center justify-center space-x-1.5 h-3">
            {[...Array(16)].map((_, i) => {
              const scale = Math.max(0.2, Math.min(1.0, audioLevel * (1 + Math.sin(i * 0.7))));
              return (
                <span 
                  key={i}
                  className={`w-1 h-3.5 rounded-full transition-transform duration-75 ${
                    activeMic === 'en-GB' ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                  style={{
                    transform: `scaleY(${scale})`,
                    opacity: 0.35 + scale * 0.65,
                    willChange: 'transform'
                  }}
                />
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          
          {/* ⚡ Auto Language Detection Mic (One-Touch Universal Auto Translation) */}
          <button
            onClick={() => toggleMic('auto')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-black text-xs transition shadow-xl ${
              activeMic === 'auto'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 text-white ring-4 ring-amber-400/40 animate-pulse'
                : isDark 
                  ? 'bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 hover:from-amber-500/30 text-amber-300 border-2 border-amber-400/60 shadow-amber-500/10' 
                  : 'bg-gradient-to-r from-amber-100 via-rose-50 to-indigo-100 hover:from-amber-200 text-indigo-950 border-2 border-indigo-400/80 shadow-md'
            }`}
            title="영·일·중·한 어떤 언어로 말해도 AI가 언어를 0.01초 만에 자동 감지하여 우측에 100% 한글로 실시간 통역합니다"
          >
            <Sparkles className={`w-4 h-4 ${activeMic === 'auto' ? 'text-amber-200' : 'text-amber-500'}`} />
            <span>
              {activeMic === 'auto' 
                ? '⏹️ 🌐 자동 언어 감지 통역 중 (ON)' 
                : '⚡ 🌐 자동 언어 감지 마이크 (AUTO)'}
            </span>
          </button>

          {/* English Accent Switcher & Mic Button */}
          <div className="flex items-center space-x-1.5">
            {/* Accent Selector (UK 🇬🇧 / US 🇺🇸) */}
            <div className={`flex items-center p-1 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'
            }`}>
              <button
                type="button"
                onClick={() => setSelectedEnglishAccent('en-GB')}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                  selectedEnglishAccent === 'en-GB'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="영국식 영어 (런던/RP 억양 특화)"
              >
                🇬🇧 영국
              </button>
              <button
                type="button"
                onClick={() => setSelectedEnglishAccent('en-US')}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                  selectedEnglishAccent === 'en-US'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="미국식 영어 (General American 억양 특화)"
              >
                🇺🇸 미국
              </button>
            </div>

            {/* Main English Mic Button */}
            <button
              onClick={() => toggleMic(selectedEnglishAccent)}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
                activeMic?.startsWith('en')
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30'
                  : isDark 
                    ? 'bg-slate-900 hover:bg-slate-700 text-amber-400 border border-amber-500/40' 
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {activeMic?.startsWith('en') ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
              <span>
                {activeMic?.startsWith('en') 
                  ? `⏹️ ${selectedEnglishAccent === 'en-GB' ? '🇬🇧 영국' : '🇺🇸 미국'} (ON)` 
                  : `🎙️ ${selectedEnglishAccent === 'en-GB' ? '🇬🇧 영국' : '🇺🇸 미국'} (OFF)`}
              </span>
            </button>
          </div>

          {/* JP Mic Button */}
          <button
            onClick={() => toggleMic('ja-JP')}
            className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
              activeMic === 'ja-JP'
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30'
                : isDark 
                  ? 'bg-slate-900 hover:bg-slate-700 text-rose-300 border border-rose-500/40' 
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            {activeMic === 'ja-JP' ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            <span>{activeMic === 'ja-JP' ? '⏹️ 🇯🇵 일어 (ON)' : '🎙️ 🇯🇵 일어 (OFF)'}</span>
          </button>

          {/* CN Mic Button */}
          <button
            onClick={() => toggleMic('zh-CN')}
            className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
              activeMic === 'zh-CN'
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30'
                : isDark 
                  ? 'bg-slate-900 hover:bg-slate-700 text-red-300 border border-red-500/40' 
                  : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {activeMic === 'zh-CN' ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            <span>{activeMic === 'zh-CN' ? '⏹️ 🇨🇳 중어 (ON)' : '🎙️ 🇨🇳 중어 (OFF)'}</span>
          </button>

          {/* KR Mic Button */}
          <button
            onClick={() => toggleMic('ko-KR')}
            className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
              activeMic === 'ko-KR'
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30'
                : isDark 
                  ? 'bg-slate-900 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40' 
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300'
            }`}
          >
            {activeMic === 'ko-KR' ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            <span>{activeMic === 'ko-KR' ? '⏹️ 🇰🇷 한국어 (ON)' : '🎙️ 🇰🇷 한국어 (OFF)'}</span>
          </button>

          {/* 🔴 Manual Audio Recording ON/OFF Adjustment Button (Default: OFF) */}
          <button
            type="button"
            onClick={toggleAudioRecording}
            className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl font-extrabold text-xs transition shadow-lg border ${
              isRecordingAudio
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400 ring-4 ring-rose-500/40 animate-pulse'
                : isDark 
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="기본은 OFF 상태이며, 필요할 때 클릭하여 실제 마이크 음성을 오디오 파일로 녹음합니다"
          >
            <span className={`w-3 h-3 rounded-full ${isRecordingAudio ? 'bg-white animate-ping' : 'bg-slate-400'}`} />
            <span>
              {isRecordingAudio 
                ? `⏹️ ● REC 녹음 중 (${formatTime(recordingSeconds)})` 
                : '⚪ 음성 파일 저장 (기본 OFF)'}
            </span>
          </button>

          {/* Manual Input Field */}
          <form onSubmit={handleManualSend} className="flex-1 flex items-center gap-2 min-w-[240px]">
            <div className="relative flex-1">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="영·일·중·한 어떤 언어든 입력하시면 실시간 초고속 한글로 자동 번역됩니다..."
                className={`w-full border rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setInputLang(prev => prev === 'auto' ? 'en-GB' : prev === 'en-GB' ? 'ja-JP' : prev === 'ja-JP' ? 'zh-CN' : prev === 'zh-CN' ? 'ko-KR' : 'auto')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold rounded border ${
                  isDark ? 'bg-slate-800 text-amber-300 hover:text-white border-slate-700' : 'bg-slate-200 text-indigo-800 hover:text-slate-900 border-slate-300'
                }`}
              >
                {inputLang === 'auto' ? '⚡ AUTO' : inputLang === 'en-GB' ? '🇬🇧 EN' : inputLang === 'ja-JP' ? '🇯🇵 JA' : inputLang === 'zh-CN' ? '🇨🇳 ZH' : '🇰🇷 KO'}
              </button>
            </div>

            <button
              type="submit"
              disabled={!customInput.trim()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs transition flex items-center space-x-1 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">번역</span>
            </button>
          </form>

        </div>

      </div>

      {/* 🧠 AI 3-Line Executive Summary & Meeting Minutes Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh] ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500 fill-current" />
                <h3 className="text-base font-black">
                  AI 비즈니스 회의록 & 3줄 요약 (Executive Summary)
                </h3>
              </div>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 text-xs select-text">
              {isGeneratingSummary ? (
                <div className="h-48 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-medium animate-pulse">
                    Gemini AI가 전체 대화를 분석하여 핵심 안건과 Action Items를 도출 중입니다...
                  </p>
                </div>
              ) : summaryData ? (
                <div className="space-y-4">
                  {/* Executive Summary 3 Lines */}
                  <div className={`p-3.5 rounded-xl border ${
                    isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}>
                    <h4 className="font-black text-amber-500 mb-1.5 flex items-center gap-1.5">
                      📌 핵심 안건 및 요약 (Executive Summary)
                    </h4>
                    <p className="leading-relaxed whitespace-pre-line font-medium">
                      {summaryData.executiveSummary || '주요 설계 변경 사항 및 인허가 준수 사항에 대한 합의가 완료되었습니다.'}
                    </p>
                  </div>

                  {/* Decisions */}
                  {summaryData.decisions && summaryData.decisions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-sky-400">
                        ✅ 주요 결정 사항 (Key Decisions)
                      </h4>
                      <ul className="space-y-1.5 list-disc list-inside opacity-90 pl-1">
                        {summaryData.decisions.map((d, i) => (
                          <li key={i} className="leading-relaxed">
                            <strong>{d.title || d}</strong>: {d.detail || ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Items */}
                  {summaryData.actionItems && summaryData.actionItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-emerald-400">
                        🎯 향후 실행 과제 (Action Items)
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {summaryData.actionItems.map((act, i) => (
                          <div key={i} className={`p-2.5 rounded-lg border ${
                            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                          } flex items-center justify-between text-[11px]`}>
                            <span className="font-semibold">{act.task || act}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                              {act.assignee || '담당자 확인'} ({act.dueDate || 'ASAP'})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">회의록을 불러오지 못했습니다.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 shrink-0">
              <span className="text-[10px] text-slate-400 font-mono">
                총 {messages.length}개 발화 분석 완료
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const textToCopy = `[ArchiSync UK AI 회의록]\n\n■ 핵심 요약:\n${summaryData?.executiveSummary || ''}\n\n■ 결정 사항:\n${(summaryData?.decisions || []).map(d => `- ${d.title || d}: ${d.detail || ''}`).join('\n')}\n\n■ Action Items:\n${(summaryData?.actionItems || []).map(a => `- ${a.task || a} (${a.assignee || ''})`).join('\n')}`;
                    navigator.clipboard.writeText(textToCopy);
                    alert('회의록이 클립보드에 복사되었습니다!');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-600 flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>전체 복사</span>
                </button>
                <button
                  onClick={() => setIsSummaryModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm"
                >
                  확인 닫기
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}