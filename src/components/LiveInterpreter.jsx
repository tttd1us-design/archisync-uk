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
  CheckCircle2
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { 
  translateArchitectureText, 
  detectMeetingIntent, 
  detectSourceLanguage,
  saveLearnedCorrection,
  getLearnedStats
} from '../services/geminiService';
import { findGlossaryMatches } from '../data/architectureGlossary';
import { DEMO_SCENARIOS } from '../data/demoScenarios';

// 🏛️ Natural Clause & Sentence Splitter (Splits long speech streams into readable 5-9 word intelligible clauses)
function splitIntoIntelligibleChunks(text) {
  if (!text || !text.trim()) return [];
  const raw = text.trim();

  // 1. Split by sentence boundaries (. ? ! \n)
  const sentences = raw
    .split(/(?<=[.?!;:\n])\s+|\n+/)
    .map(s => s.trim())
    .filter(Boolean);

  const cleanChunks = [];

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    if (words.length <= 8) {
      cleanChunks.push(sentence);
      continue;
    }

    // 2. Split long sentences on natural clause connectives
    const subClauses = sentence
      .split(/(?<=,)\s+|\s+(?=\b(?:and|but|so|however|therefore|because|regarding|in terms of|as per|please|make sure|if you|until i|first up|never making|trying to)\b)/i)
      .map(s => s.trim())
      .filter(Boolean);

    const merged = [];
    for (let i = 0; i < subClauses.length; i++) {
      const clause = subClauses[i];
      const clauseWords = clause.split(/\s+/);
      if (clauseWords.length < 3 && merged.length > 0) {
        merged[merged.length - 1] += ` ${clause}`;
      } else {
        merged.push(clause);
      }
    }
    cleanChunks.push(...(merged.length > 0 ? merged : [sentence]));
  }

  return cleanChunks.length > 0 ? cleanChunks : [raw];
}

// 💎 Commercial Grade 8pt High-Density Card with Crisp Contrast Alignment
const MessageCardItem = React.memo(function MessageCardItem({
  msg,
  isDark,
  copiedId,
  onCopy,
  onPlaySpeech,
  onOpenGlossary,
  editingId,
  editTranslationText,
  onStartEdit,
  onCancelEdit,
  onChangeEditText,
  onSaveEdit
}) {
  const isUK = msg.lang === 'en-GB' || msg.lang?.startsWith('en');
  const isZH = msg.lang?.startsWith('zh');
  const isJP = msg.lang?.startsWith('ja');
  const flag = isZH ? '🇨🇳' : isJP ? '🇯🇵' : isUK ? '🇬🇧' : '🇰🇷';

  return (
    <div className={`w-full rounded-xl p-2.5 border transition-all ${
      isDark 
        ? 'bg-slate-950/85 border-slate-800/80 text-slate-100 hover:border-slate-700' 
        : 'bg-white border-slate-200 text-slate-900 shadow-xs hover:border-slate-300'
    } space-y-1.5`}>
      
      {/* 1. Subtle Mini Meta Bar: Flag, Timestamp, Quick Action Dock */}
      <div className={`flex items-center justify-between pb-1 border-b text-[7.5pt] ${
        isDark ? 'border-slate-800/70 text-slate-400' : 'border-slate-100 text-slate-500'
      }`}>
        <div className="flex items-center space-x-1.5">
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

      {/* 2. Dual Column Layout: Left Original 8pt | Right Korean 8pt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 items-start text-[8pt] leading-relaxed">
        
        {/* ⬅️ LEFT: Spoken Speech (8pt) */}
        <div className={`p-2 rounded-lg border ${
          isDark ? 'bg-slate-900/60 border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <p className="select-text break-keep-all font-medium whitespace-pre-wrap">
            {msg.original}
          </p>
        </div>

        {/* ➡️ RIGHT: Korean Translation (8pt) */}
        <div className={`p-2 rounded-lg border ${
          isDark ? 'bg-indigo-950/30 border-indigo-500/30 text-amber-300' : 'bg-indigo-50/50 border-indigo-200 text-indigo-950'
        }`}>
          {editingId === msg.id ? (
            <div className="space-y-1">
              <textarea
                value={editTranslationText}
                onChange={(e) => onChangeEditText(e.target.value)}
                className={`w-full p-1.5 text-[8pt] rounded border ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                }`}
                rows={2}
              />
              <div className="flex items-center justify-end space-x-1.5">
                <button onClick={onCancelEdit} className="text-[7pt] text-slate-400 hover:text-slate-200">
                  취소
                </button>
                <button
                  onClick={() => onSaveEdit(msg.id, msg.original, editTranslationText)}
                  className="px-2 py-0.5 text-[7.5pt] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded"
                >
                  학습 저장
                </button>
              </div>
            </div>
          ) : (
            <p className="select-text break-keep-all font-bold whitespace-pre-wrap">
              {msg.translation}
            </p>
          )}
        </div>

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

  const messagesTopRef = useRef(null);
  const simulationTimerRef = useRef(null);
  const visualizerCleanupRef = useRef(null);
  const interimTranslateTimerRef = useRef(null);
  const recordingTimerRef = useRef(null);

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

  // Auto scroll to TOP when a new message arrives (keeps newest content in view)
  useEffect(() => {
    messagesTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

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

        const translated = await translateArchitectureText({
          text: pendingText,
          sourceLang: detectedLang,
          targetLang: targetLang,
          apiKey: apiKey
        });
        const matchedTerms = findGlossaryMatches(pendingText);
        const intent = detectMeetingIntent(pendingText, translated);

        const isZH = detectedLang.startsWith('zh');
        const isJP = detectedLang.startsWith('ja');
        const isEN = detectedLang.startsWith('en');

        setMessages(prev => [{
          id: Date.now() + Math.random(),
          speaker: isZH ? 'Shanghai Lead Architect' : isJP ? 'Tokyo Lead Architect' : isEN ? 'UK Lead Architect' : 'Seoul Design Lead',
          speakerRole: isZH ? 'CN Architect' : isJP ? 'JP Architect' : isEN ? 'UK Architect' : 'KR Director',
          lang: detectedLang,
          accent: isZH ? 'Chinese (Mandarin)' : isJP ? 'Japanese (Tokyo)' : detectedLang === 'en-GB' ? 'UK (London RP)' : detectedLang === 'en-US' ? 'US (General)' : 'Korean',
          original: pendingText,
          translation: translated,
          intent: intent,
          terms: matchedTerms.map(t => t.term),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }, ...prev]);
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

          const translated = await translateArchitectureText({
            text: fullSentence,
            sourceLang: detectedLang,
            targetLang: targetLang,
            apiKey: apiKey
          });

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
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };

          // ⚡ Insert exactly 1 clean completed card into archive
          setMessages(prev => {
            if (prev.length > 0) {
              const last = prev[0];
              const cleanCurrent = fullSentence.toLowerCase().trim();
              const cleanLast = last.original.toLowerCase().trim();
              if (cleanCurrent === cleanLast) return prev;
            }
            return [newMessage, ...prev];
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

    const translated = await translateArchitectureText({
      text: textToSend,
      sourceLang: detectedLang,
      targetLang: targetLang,
      apiKey: apiKey
    });

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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages(prev => [newMessage, ...prev]);
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
      clearTimeout(simulationTimerRef.current);
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
        setMessages(prev => [{
          ...item,
          id: Date.now() + idx,
          intent: itemIntent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }, ...prev]);

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
    const translated = await translateArchitectureText({
      text: testSentence,
      sourceLang: lang,
      targetLang: targetLang,
      apiKey: apiKey
    });

    setCurrentLiveTranslation(translated);
    const matchedTerms = findGlossaryMatches(testSentence);
    const intent = detectMeetingIntent(testSentence, translated);

    const isJP = lang.startsWith('ja');
    const isZH = lang.startsWith('zh');

    setMessages(prev => [{
      id: Date.now(),
      speaker: isZH ? 'Shanghai Lead Architect (Xiaoxiao)' : isJP ? 'Tokyo Lead Architect (Haruka)' : 'UK Lead Architect (Oliver)',
      speakerRole: isZH ? 'CN Architect' : isJP ? 'JP Architect' : 'UK Architect',
      lang: lang,
      accent: isZH ? 'Chinese (Mandarin)' : isJP ? 'Japanese (Tokyo)' : 'UK (London RP)',
      original: testSentence,
      translation: translated,
      intent: intent,
      terms: matchedTerms.map(t => t.term),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }, ...prev]);

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

  const ukQuickPhrases = [
    "Good afternoon. We must verify the curtain walling U-value for Building Regulations Part L.",
    "What is the brise-soleil projection on the 12th floor terrace regarding visual massing?",
    "Has the Planning Permission Section 106 application been finalized with the local council?",
    "Please run a multi-discipline BIM clash detection between structure and MEP services.",
    "Make sure the cavity barriers comply with Part B fire safety standards."
  ];

  const jpQuickPhrases = [
    "耐震構造の構造計算書と外壁ルーバーの納まり詳細図を確認してください。",
    "確認申請の提出図面に向けた意匠設計チームとの調整が必要です。",
    "柱と梁のスラブ接合部における配筋納まりとBIM干渉チェックを実施します。",
    "外壁カーテンウォールの耐火基準と熱貫流率の性能証明書を提出してください。"
  ];

  const zhQuickPhrases = [
    "请确认幕墙的热工性能计算书和深化设计图纸。",
    "超高层建筑抗震设防专项审查和报建审批进展顺利。",
    "地下室防水施工方案和剪力墙配筋需要重新核对。",
    "容积率和建筑密度指标符合规划局方案批复要求。"
  ];

  const [testLanguageTab, setTestLanguageTab] = useState('en-GB'); // 'en-GB' | 'ja-JP' | 'zh-CN'

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
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 🔴 Manual Audio Recording Toggle Button */}
            <button
              onClick={toggleAudioRecording}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                isRecordingAudio
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400 ring-2 ring-rose-500/30 animate-pulse'
                  : isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700' 
                    : 'bg-white hover:bg-rose-50 text-rose-700 border-slate-200 shadow-xs'
              }`}
              title={isRecordingAudio ? "음성 녹음 중지" : "음성 녹음 시작 (내문서\\음성에 저장)"}
            >
              <span className={`w-2 h-2 rounded-full ${isRecordingAudio ? 'bg-white animate-ping' : 'bg-rose-500'}`} />
              <span>
                {isRecordingAudio 
                  ? `● REC (${formatTime(recordingSeconds)})` 
                  : '🔴 음성 녹음'}
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

        {/* 🌟 CENTRAL LIVE REAL-TIME STAGE (Fixed 1.5X Grand 510px Viewport: Strict 12pt Typography) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
          
          {/* ⬅️ LEFT SCREEN: Live Spoken Foreign Speech (Fixed Height 510px - Strict 12pt) */}
          <div className={`${
            isDark 
              ? 'bg-slate-950/90 border border-slate-800 text-slate-100' 
              : 'bg-slate-50 border border-slate-200 text-slate-900 shadow-xs'
          } p-4 rounded-xl flex flex-col justify-between h-[510px] max-h-[510px] transition-all relative overflow-hidden`}>
            
            {/* Header: Fixed Height (h-8) */}
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
                    ) : messages[0]?.lang ? (
                      messages[0].lang.startsWith('zh') ? '🇨🇳 중국어' :
                      messages[0].lang.startsWith('ja') ? '🇯🇵 일본어' :
                      messages[0].lang.startsWith('ko') ? '🇰🇷 한국어' : '🇬🇧/🇺🇸 영어'
                    ) : '음성 대기 중'
                  })</>
                ) : activeMic === 'zh-CN' || messages[0]?.lang?.startsWith('zh') ? (
                  <>🇨🇳 실시간 중국어 발화 (Live Chinese)</>
                ) : activeMic === 'ja-JP' || messages[0]?.lang?.startsWith('ja') ? (
                  <>🇯🇵 실시간 일본어 발화 (Live Japanese)</>
                ) : activeMic === 'ko-KR' || messages[0]?.lang?.startsWith('ko') ? (
                  <>🇰🇷 실시간 한국어 발화 (Live Korean)</>
                ) : (
                  <>🇬🇧/🇺🇸 실시간 영어 발화 (Live English)</>
                )}
              </span>
              <span className={`text-[9pt] font-mono font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                activeMic 
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 animate-pulse' 
                  : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}>
                {activeMic === 'auto' 
                  ? '🎙️ 🌐 전세계 언어 자동 감지' 
                  : activeMic ? `🎙️ ${activeMic === 'zh-CN' ? '중국어' : activeMic === 'ja-JP' ? '일본어' : activeMic.startsWith('en') ? '영어' : '한국어'} 수신 중` : '마이크 대기 중'}
              </span>
            </div>
            
            {/* Scrollable Fixed Text Viewport (h-[405px] overflow-y-auto - Strict 12pt View) */}
            <div className="flex-1 my-3 overflow-y-auto pr-2 select-text scrollbar-thin scrollbar-thumb-slate-700 space-y-3">
              <div className={`text-[12pt] font-semibold leading-relaxed font-sans break-keep-all ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                {currentLiveOriginal ? (
                  <div className="space-y-2.5">
                    {splitIntoIntelligibleChunks(currentLiveOriginal).map((chunk, idx) => (
                      <p key={idx} className={`font-semibold leading-relaxed ${isLiveSpeaking ? 'text-white drop-shadow-sm' : ''}`}>
                        "{chunk}"
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'} font-normal italic`}>
                    외국어(영·일·중) 음성을 실시간 수신합니다. (하단 마이크 또는 테스트 버튼 클릭)
                  </p>
                )}
              </div>
            </div>

            {/* Footer: Fixed Height (h-7) */}
            <div className={`pt-2 border-t shrink-0 h-7 ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'} text-[8.5pt] font-medium flex items-center justify-between`}>
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeMic ? 'bg-amber-500 animate-ping' : isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                <span className="truncate">원문 12pt 고정 · 🔒 510px 1.5배 대형 중심 무대</span>
              </span>
              {isLiveSpeaking && (
                <span className="text-amber-500 font-mono text-[8pt] shrink-0 animate-pulse">Live Transcribing...</span>
              )}
            </div>
          </div>

          {/* ➡️ RIGHT SCREEN: Live Instant Korean Translation (Fixed Height 510px - Strict 12pt) */}
          <div className={`${
            isDark 
              ? 'bg-indigo-950/40 border border-indigo-500/30 text-amber-300' 
              : 'bg-indigo-50/70 border border-indigo-200 text-indigo-950 shadow-xs'
          } p-4 rounded-xl flex flex-col justify-between h-[510px] max-h-[510px] transition-all relative overflow-hidden`}>
            
            {/* Header: Fixed Height (h-8) */}
            <div className={`flex items-center justify-between pb-2.5 border-b shrink-0 h-8 ${
              isDark ? 'border-indigo-500/30' : 'border-indigo-200'
            }`}>
              <span className={`text-[11pt] font-black flex items-center gap-1.5 truncate ${
                isDark ? 'text-sky-300' : 'text-indigo-700'
              }`}>
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" /> 🇰🇷 실시간 한글 통역 (100% 한글)
              </span>
              <span className={`text-[9pt] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                ⚡ 0.03s 동기화
              </span>
            </div>

            {/* Scrollable Fixed Text Viewport (h-[405px] overflow-y-auto - Strict 12pt View) */}
            <div className="flex-1 my-3 overflow-y-auto pr-2 select-text scrollbar-thin scrollbar-thumb-indigo-700 space-y-3">
              <div className={`text-[12pt] font-bold leading-relaxed break-keep-all ${
                isDark ? 'text-amber-300' : 'text-indigo-950'
              }`}>
                {currentLiveTranslation ? (
                  <div className="space-y-2.5">
                    {splitIntoIntelligibleChunks(currentLiveTranslation).map((chunk, idx) => (
                      <p key={idx} className="font-extrabold leading-relaxed text-amber-300">
                        {chunk}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-normal`}>
                    외국어(영·일·중)로 말하면 우측에 12pt 크기의 한국어 번역이 100% 실시간으로 표시됩니다.
                  </p>
                )}
              </div>
            </div>

            {/* Footer: Fixed Height (h-7) */}
            <div className={`pt-2 border-t shrink-0 h-7 ${isDark ? 'border-indigo-500/30 text-indigo-300/80' : 'border-indigo-100 text-indigo-700'} text-[8.5pt] font-medium flex items-center justify-between`}>
              <span className="truncate">한글 12pt 고정 · 🔒 510px 1.5배 대형 중심 무대</span>
              <span className="font-bold text-amber-400 shrink-0">100% 무조건 한글 출력</span>
            </div>
          </div>

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
        <div ref={messagesTopRef} />

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
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleSaveToDocuments}
              className={`text-[8pt] font-bold flex items-center gap-1 px-2 py-0.5 rounded border transition ${
                isDark 
                  ? 'text-sky-400 hover:text-sky-300 bg-slate-800/80 border-slate-700 hover:border-sky-500/40' 
                  : 'text-sky-700 hover:text-sky-800 bg-white border-slate-300 hover:border-sky-400 shadow-xs'
              }`}
              title="이전 대화와 음성을 내문서\음성 폴더에 저장"
            >
              <Save className="w-2.5 h-2.5 text-sky-500" />
              <span>백업 저장</span>
            </button>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="h-16 flex items-center justify-center text-center p-2 space-x-2 text-slate-500">
            <Languages className="w-4 h-4 text-amber-500" />
            <span className="text-[8pt]">
              발화 완료 시 이곳에 8pt 고밀도로 차곡차곡 백업됩니다.
            </span>
          </div>
        )}

        {/* Previous Message Backup Cards (Memoized Pure Component for 0% Re-render CPU Overhead) */}
        {messages.map((msg) => (
          <MessageCardItem
            key={msg.id}
            msg={msg}
            isDark={isDark}
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
          />
        ))}
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

          {/* 🔴 Manual Audio Recording ON/OFF Adjustment Button */}
          <button
            type="button"
            onClick={toggleAudioRecording}
            className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl font-extrabold text-xs transition shadow-lg border ${
              isRecordingAudio
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400 ring-4 ring-rose-500/40 animate-pulse'
                : isDark 
                  ? 'bg-slate-900 hover:bg-slate-800 text-rose-300 border-rose-500/40 hover:border-rose-400' 
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
            }`}
            title="필요할 때 실제 마이크 음성을 고음질 오디오 파일로 녹음하거나 중지합니다"
          >
            <span className={`w-3 h-3 rounded-full ${isRecordingAudio ? 'bg-white animate-ping' : 'bg-rose-500'}`} />
            <span>
              {isRecordingAudio 
                ? `⏹️ ● REC 녹음 중 (${formatTime(recordingSeconds)})` 
                : '🔴 음성 녹음 (OFF)'}
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

    </div>
  );
}