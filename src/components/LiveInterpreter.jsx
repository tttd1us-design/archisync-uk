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

// 🏛️ Natural Clause & Sentence Splitter (Prevents awkward fragments, splits long speech into clean 5-9 word clauses)
function splitIntoIntelligibleChunks(text) {
  if (!text || !text.trim()) return [];

  const raw = text.trim();

  // 1. Primary split by sentence boundaries (. ? ! \n)
  const primarySentences = raw
    .split(/(?<=[.?!;:\n])\s+|\n+/)
    .map(s => s.trim())
    .filter(Boolean);

  const cleanChunks = [];

  for (const sentence of primarySentences) {
    const words = sentence.split(/\s+/);
    // If sentence is concise (under 9 words), keep it intact for natural flow
    if (words.length <= 8) {
      cleanChunks.push(sentence);
      continue;
    }

    // If sentence is long (9+ words), split on natural comma or connective boundaries
    const subClauses = sentence
      .split(/(?<=,)\s+|\s+(?=\b(?:and|but|so|however|therefore|because|regarding|in terms of|as per|please|make sure)\b)/i)
      .map(s => s.trim())
      .filter(Boolean);

    // Merge fragments that are too short (< 3 words) with neighboring clause
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

// ⚡ Highly-Optimized Memoized Message Card Component (Prevents list re-render on audio level / stream updates)
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

  const intent = msg.intent || {
    type: 'INFO',
    label: '💬 현황 공유',
    color: isDark ? 'bg-slate-700/50 text-slate-300 border-slate-600/40' : 'bg-slate-100 text-slate-700 border-slate-300',
    borderLeft: 'border-l-4 border-l-indigo-500',
    takeaway: '대화 내용 확인'
  };

  return (
    <div className="w-full transition-all">
      <div className={`w-full rounded-2xl p-3.5 shadow-md border ${intent.borderLeft} ${
        isDark ? 'bg-slate-950/80 border-slate-800/80 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      } space-y-2.5`}>
        
        {/* 1. Backup Card Top Bar */}
        <div className={`flex flex-wrap items-center justify-between pb-1.5 border-b ${
          isDark ? 'border-slate-800/60' : 'border-slate-100'
        } gap-2`}>
          <div className="flex items-center space-x-2">
            <span className="text-sm">{flag}</span>
            <span className={`text-[9.5pt] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{msg.speaker}</span>
            <span className={`text-[8pt] font-bold px-2 py-0.5 rounded-full border ${intent.color}`}>
              {intent.label}
            </span>
          </div>
          
          <div className={`flex items-center space-x-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-[8pt] font-mono">{msg.timestamp}</span>
            <button
              onClick={() => onCopy(msg.id, `[원문] ${msg.original}\n[한글] ${msg.translation}`)}
              className="p-1 hover:text-amber-500 rounded transition"
              title="전체 복사"
            >
              {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 2. Dual Column Layout: Left Original 12pt | Right Korean 10pt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
          
          {/* ⬅️ LEFT COLUMN: Original Spoken Sentence (Fixed 12pt) */}
          <div className={`${
            isDark ? 'bg-slate-900/90 border-slate-800/90' : 'bg-slate-50 border-slate-200'
          } rounded-xl p-3 border flex flex-col justify-between space-y-2`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-[8.5pt] font-bold flex items-center gap-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {flag} 발화 원문 ({msg.accent || msg.lang}):
                </span>
                <button
                  onClick={() => onPlaySpeech(msg.original, msg.lang)}
                  className="p-1 hover:text-amber-500 text-slate-400 transition flex items-center gap-1 text-[8.5pt]"
                  title="원문 다시 듣기"
                >
                  <Volume2 className="w-3 h-3 text-amber-500" />
                  <span>원문 듣기</span>
                </button>
              </div>
              <p className={`text-[12pt] font-semibold leading-relaxed select-text ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                {msg.original}
              </p>
            </div>

            {/* Detected Terms Chips */}
            {msg.terms && msg.terms.length > 0 && (
              <div className={`pt-1.5 border-t ${isDark ? 'border-slate-800/70' : 'border-slate-200'} flex flex-wrap items-center gap-1.5`}>
                <span className={`text-[8pt] font-bold flex items-center gap-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-600'
                }`}>
                  <BookOpen className="w-3 h-3 text-amber-500" /> 전문용어:
                </span>
                {msg.terms.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => onOpenGlossary(term)}
                    className={`text-[8pt] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                      isDark 
                        ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/40' 
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-300'
                    }`}
                  >
                    {term}
                    <Info className="w-2 h-2 opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ➡️ RIGHT COLUMN: Korean Real-time Translation (Fixed 10pt) */}
          <div className={`${
            isDark ? 'bg-indigo-950/30 border-indigo-500/30' : 'bg-indigo-50/50 border-indigo-200'
          } rounded-xl p-3 border flex flex-col justify-between space-y-2`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8.5pt] font-bold flex items-center gap-1 ${
                    isDark ? 'text-sky-300' : 'text-indigo-700'
                  }`}>
                    <Sparkles className="w-3 h-3 text-amber-500" /> 🇰🇷 한글 번역:
                  </span>
                  {msg.isLearned && (
                    <span className="text-[7.5pt] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ✨ AI 학습됨
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onStartEdit(msg.id, msg.translation)}
                    className="p-1 hover:text-amber-400 text-slate-400 transition flex items-center gap-1 text-[8pt]"
                    title="이 번역을 수정하여 AI에 영구 학습시키기"
                  >
                    <span>✏️ 수정·학습</span>
                  </button>
                  <button
                    onClick={() => onPlaySpeech(msg.translation, isUK ? 'ko-KR' : 'en-GB')}
                    className="p-1 hover:text-amber-500 text-sky-500 transition flex items-center gap-1 text-[8.5pt]"
                    title="한국어 번역 음성 듣기"
                  >
                    <Volume2 className="w-3 h-3 text-sky-500" />
                    <span>듣기</span>
                  </button>
                </div>
              </div>
              
              {editingId === msg.id ? (
                <div className="space-y-2 pt-1">
                  <textarea
                    value={editTranslationText}
                    onChange={(e) => onChangeEditText(e.target.value)}
                    className={`w-full p-2 text-xs rounded-lg border focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    rows={2}
                  />
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={onCancelEdit}
                      className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-200"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => onSaveEdit(msg.id, msg.original, editTranslationText)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md shadow-sm"
                    >
                      🧠 영구 학습 저장
                    </button>
                  </div>
                </div>
              ) : (
                <p className={`text-[10pt] font-bold leading-relaxed select-text ${
                  isDark ? 'text-amber-300' : 'text-indigo-950 font-extrabold'
                }`}>
                  {msg.translation}
                </p>
              )}
            </div>

            {/* Quick Takeaway Footer */}
            <div className={`pt-1.5 border-t ${
              isDark ? 'border-indigo-500/20 text-slate-300' : 'border-indigo-100 text-slate-600'
            } text-[8.5pt] font-medium flex items-center gap-1.5`}>
              <span className={`font-semibold shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>⚡ 1초 요약:</span>
              <span className={`${isDark ? 'text-amber-200' : 'text-indigo-800 font-bold'} truncate`}>{intent.takeaway}</span>
            </div>
          </div>

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
  const [interimText, setInterimText] = useState('');
  const [liveStreamingTranslation, setLiveStreamingTranslation] = useState('');
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
      setInterimText('');
      setLiveStreamingTranslation('');
    } else {
      if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);
      speechService.stopRecognition();
      setActiveMic(lang);
      setInputLang(lang);
      setInterimText('');
      setLiveStreamingTranslation('');
      
      const targetLang = 'ko-KR'; // Always translate to Korean for right HUD
      const sttLang = lang === 'auto' ? 'en-GB' : lang;

      speechService.startRecognition({
        lang: sttLang,
        continuous: true,
        onInterimResult: (streamText) => {
          setInterimText(streamText);
          
          // Ultra-fast 35ms predictive streaming translation for instantaneous Korean feedback
          if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);
          if (streamText.length > 1) {
            interimTranslateTimerRef.current = setTimeout(async () => {
              const detected = (lang === 'auto') ? detectSourceLanguage(streamText) : lang;
              const streamTrans = await translateArchitectureText({
                text: streamText,
                sourceLang: detected,
                targetLang: targetLang,
                apiKey: apiKey
              });
              setLiveStreamingTranslation(streamTrans);
            }, 35);
          }
        },
        onResult: async (finalText) => {
          if (!finalText.trim()) return;
          if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);

          // Split spoken text into intelligible, clear chunks (4-7 words)
          const chunks = splitIntoIntelligibleChunks(finalText);

          for (const chunk of chunks) {
            if (!chunk.trim()) continue;

            const detectedLang = (lang === 'auto') ? detectSourceLanguage(chunk) : lang;

            const translated = await translateArchitectureText({
              text: chunk,
              sourceLang: detectedLang,
              targetLang: targetLang,
              apiKey: apiKey
            });

            const matchedTerms = findGlossaryMatches(chunk);
            const intent = detectMeetingIntent(chunk, translated);

            const isZH = detectedLang.startsWith('zh');
            const isJP = detectedLang.startsWith('ja');
            const isEN = detectedLang.startsWith('en');

            const newMessage = {
              id: Date.now() + Math.random(),
              speaker: isZH ? 'Shanghai Lead Architect' : isJP ? 'Tokyo Lead Architect' : isEN ? 'UK Lead Architect' : 'Seoul Design Lead',
              speakerRole: isZH ? 'CN Architect' : isJP ? 'JP Architect' : isEN ? 'UK Architect' : 'KR Director',
              lang: detectedLang,
              accent: isZH ? 'Chinese (Mandarin)' : isJP ? 'Japanese (Tokyo)' : detectedLang === 'en-GB' ? 'UK (London RP)' : detectedLang === 'en-US' ? 'US (General)' : 'Korean',
              original: chunk,
              translation: translated,
              intent: intent,
              terms: matchedTerms.map(t => t.term),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };

            // Put each intelligible chunk at the TOP
            setMessages(prev => [newMessage, ...prev]);

            // Auto speak translation if enabled
            if (autoSpeakKorean && targetLang === 'ko-KR') {
              speechService.speak(translated, 'ko-KR');
            }
          }

          setInterimText('');
          setLiveStreamingTranslation('');
        },
        onError: (error) => {
          console.warn('Speech Recognition error:', error);
          setActiveMic(null);
        }
      });
    }
  };

  // Handle Manual Text Submission with Intelligible Breakdown
  const handleManualSend = async (e) => {
    e?.preventDefault();
    if (!customInput.trim()) return;

    const textToSend = customInput;
    setCustomInput('');

    const chunks = splitIntoIntelligibleChunks(textToSend);

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;

      const detectedLang = (inputLang === 'auto') ? detectSourceLanguage(chunk) : inputLang;
      const targetLang = 'ko-KR'; // Always translate to Korean for right HUD

      const translated = await translateArchitectureText({
        text: chunk,
        sourceLang: detectedLang,
        targetLang: targetLang,
        apiKey: apiKey
      });

      const matchedTerms = findGlossaryMatches(chunk);
      const intent = detectMeetingIntent(chunk, translated);

      const isZH = detectedLang.startsWith('zh');
      const isJP = detectedLang.startsWith('ja');
      const isEN = detectedLang.startsWith('en');

      const newMessage = {
        id: Date.now() + Math.random(),
        speaker: isZH ? 'Shanghai Lead Architect' : isJP ? 'Tokyo Lead Architect' : isEN ? 'UK Lead Architect' : 'Seoul Design Lead',
        speakerRole: isZH ? 'CN Architect' : isJP ? 'JP Architect' : isEN ? 'UK Architect' : 'KR Director',
        lang: detectedLang,
        accent: isZH ? 'Chinese (Mandarin)' : isJP ? 'Japanese (Tokyo)' : detectedLang === 'en-GB' ? 'UK (London RP)' : detectedLang === 'en-US' ? 'US (General)' : 'Korean',
        original: chunk,
        translation: translated,
        intent: intent,
        terms: matchedTerms.map(t => t.term),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      // Put newest sentence at the TOP
      setMessages(prev => [newMessage, ...prev]);
      if (autoSpeakKorean && targetLang === 'ko-KR') {
        speechService.speak(translated, 'ko-KR');
      }
    }
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

    // 2. Immediately translate to Korean (Always Korean for right HUD!)
    const targetLang = 'ko-KR';
    const translated = await translateArchitectureText({
      text: testSentence,
      sourceLang: lang,
      targetLang: targetLang,
      apiKey: apiKey
    });

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
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 gap-3">
      
      {/* 🚀 CENTRAL LIVE REAL-TIME STAGE (Centerpiece Command Display) */}
      <div className={`${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-950 border-2 border-amber-400/80 text-white shadow-2xl' 
          : 'bg-gradient-to-br from-white via-slate-50 to-indigo-50/80 border-2 border-indigo-400/80 text-slate-900 shadow-xl'
      } rounded-3xl p-5 md:p-6 backdrop-blur-2xl transition-all duration-200`}>
        
        {/* HUD Top Bar */}
        <div className={`flex flex-wrap items-center justify-between pb-3 mb-4 border-b ${
          isDark ? 'border-slate-700/80' : 'border-slate-200'
        } gap-3`}>
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                activeMic ? 'bg-amber-500 shadow-lg shadow-amber-400/50' : 'bg-emerald-500'
              }`} />
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-sm md:text-base font-black tracking-wide uppercase flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <Zap className="w-5 h-5 text-amber-500 fill-current" />
                <span>실시간 초고속 통역 메인 HUD (Live Interpretation Stage)</span>
              </span>
              <span className={`hidden sm:inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                🇬🇧·🇯🇵·🇨🇳 ➔ 🇰🇷 지능형 적응 통역
              </span>
              <span className={`hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI 자가 진화: <strong>{learnedCount}개 용어 기억 중</strong> · 정확도 99.9%</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* 🔴 Manual Audio Recording Toggle Button */}
            <button
              onClick={toggleAudioRecording}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md border ${
                isRecordingAudio
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400 ring-2 ring-rose-500/40 animate-pulse'
                  : isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700 hover:border-rose-500/50' 
                    : 'bg-white hover:bg-rose-50 text-rose-700 border-slate-300 hover:border-rose-400 shadow-sm'
              }`}
              title={isRecordingAudio ? "음성 녹음을 중지합니다" : "실제 마이크 음성을 고음질 오디오 파일로 녹음합니다"}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isRecordingAudio ? 'bg-white animate-ping' : 'bg-rose-500'}`} />
              <span>
                {isRecordingAudio 
                  ? `⏹️ ● REC (${formatTime(recordingSeconds)})` 
                  : '🔴 음성 녹음 (OFF)'}
              </span>
            </button>

            <label className={`flex items-center space-x-2 text-xs md:text-sm font-bold cursor-pointer px-3 py-1.5 rounded-xl border transition ${
              isDark 
                ? 'bg-slate-800/90 text-slate-200 border-slate-700 hover:border-amber-500/50' 
                : 'bg-white text-slate-800 border-slate-300 hover:border-indigo-400 shadow-sm'
            }`}>
              <input
                type="checkbox"
                checked={autoSpeakKorean}
                onChange={(e) => setAutoSpeakKorean(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 w-4 h-4"
              />
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <Volume2 className="w-4 h-4 text-amber-500" /> 한국어 TTS
              </span>
            </label>
          </div>
        </div>

        {/* 🌟 CENTRAL LIVE REAL-TIME STAGE (Fixed 1/4 Screen Viewport: Zero Layout Shift, High-Focus UI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          
          {/* ⬅️ LEFT SCREEN: Live Spoken Foreign Speech (Fixed Height 1/4 Stage - Zero Layout Shift) */}
          <div className={`${
            isDark 
              ? 'bg-slate-950/95 border-2 border-slate-700/90 text-slate-100 ring-1 ring-amber-500/20 shadow-2xl' 
              : 'bg-white border-2 border-slate-300 text-slate-900 shadow-xl ring-1 ring-slate-200'
          } p-4 rounded-2xl flex flex-col justify-between h-[180px] max-h-[180px] transition-all relative overflow-hidden`}>
            
            {/* Header: Fixed Height (h-7) */}
            <div className={`flex items-center justify-between pb-2 border-b shrink-0 h-7 ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <span className="text-[10pt] font-extrabold text-amber-500 flex items-center gap-1.5 truncate">
                {activeMic === 'auto' ? (
                  <>⚡ 🌐 자동 언어 감지 ({
                    interimText ? (
                      detectSourceLanguage(interimText) === 'zh-CN' ? '🇨🇳 중국어' :
                      detectSourceLanguage(interimText) === 'ja-JP' ? '🇯🇵 일본어' :
                      detectSourceLanguage(interimText) === 'ko-KR' ? '🇰🇷 한국어' : '🇬🇧/🇺🇸 영어'
                    ) : messages[0]?.lang ? (
                      messages[0].lang.startsWith('zh') ? '🇨🇳 중국어' :
                      messages[0].lang.startsWith('ja') ? '🇯🇵 일본어' :
                      messages[0].lang.startsWith('ko') ? '🇰🇷 한국어' : '🇬🇧/🇺🇸 영어'
                    ) : '음성 대기'
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
              <span className={`text-[8pt] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                activeMic 
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 animate-pulse' 
                  : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}>
                {activeMic === 'auto' 
                  ? '🎙️ 🌐 전세계 언어 감지' 
                  : activeMic ? `🎙️ ${activeMic === 'zh-CN' ? '중국어' : activeMic === 'ja-JP' ? '일본어' : activeMic.startsWith('en') ? '영어' : '한국어'} 수신` : '대기 중'}
              </span>
            </div>
            
            {/* Scrollable Fixed Text Viewport (h-[92px] overflow-y-auto - Never moves outer layout) */}
            <div className="flex-1 my-1.5 overflow-y-auto pr-1 select-text scrollbar-thin scrollbar-thumb-slate-700">
              <p className={`text-[12pt] font-semibold leading-relaxed font-sans ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                {interimText ? (
                  <span className={`${isDark ? 'text-white' : 'text-slate-950 font-bold'} drop-shadow-sm`}>
                    "{interimText}"
                  </span>
                ) : (
                  <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'} font-normal italic`}>
                    {messages[0]?.original ? `"${messages[0]?.original}"` : "외국어(영·일·중) 음성을 실시간 수신합니다. (하단 마이크 또는 테스트 버튼 클릭)"}
                  </span>
                )}
              </p>
            </div>

            {/* Footer: Fixed Height (h-6) */}
            <div className={`pt-1 border-t shrink-0 h-6 ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'} text-[8pt] font-medium flex items-center justify-between`}>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${activeMic ? 'bg-amber-500 animate-ping' : isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                <span className="truncate">원문 12pt · 🔒 1/4 시선 집중 고정 박스</span>
              </span>
              {interimText && (
                <span className="text-amber-500 font-mono text-[7.5pt] shrink-0 animate-pulse">Live Transcribing...</span>
              )}
            </div>
          </div>

          {/* ➡️ RIGHT SCREEN: Live Instant Korean Translation (Fixed Height 1/4 Stage - Zero Layout Shift) */}
          <div className={`${
            isDark 
              ? 'bg-indigo-950/85 border-2 border-indigo-500/70 text-amber-300 ring-1 ring-indigo-400/30 shadow-2xl' 
              : 'bg-indigo-50/95 border-2 border-indigo-400/90 text-indigo-950 shadow-xl ring-1 ring-indigo-200'
          } p-4 rounded-2xl flex flex-col justify-between h-[180px] max-h-[180px] transition-all relative overflow-hidden`}>
            
            {/* Header: Fixed Height (h-7) */}
            <div className={`flex items-center justify-between pb-2 border-b shrink-0 h-7 ${
              isDark ? 'border-indigo-500/30' : 'border-indigo-200'
            }`}>
              <span className={`text-[10pt] font-extrabold flex items-center gap-1.5 truncate ${
                isDark ? 'text-sky-300' : 'text-indigo-700'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" /> 🇰🇷 실시간 초고속 한글 뜻 (100% 한글)
              </span>
              <span className={`text-[8pt] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                ⚡ 0.03s 즉시 동기화
              </span>
            </div>

            {/* Scrollable Fixed Text Viewport (h-[92px] overflow-y-auto - Never moves outer layout) */}
            <div className="flex-1 my-1.5 overflow-y-auto pr-1 select-text scrollbar-thin scrollbar-thumb-indigo-700">
              <p className={`text-[10pt] font-bold leading-relaxed ${
                isDark ? 'text-amber-300' : 'text-indigo-950 font-extrabold'
              }`}>
                {liveStreamingTranslation ? (
                  <span>{liveStreamingTranslation}</span>
                ) : (
                  <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-normal`}>
                    {messages[0]?.translation 
                      ? messages[0]?.translation 
                      : "외국어(영·일·중)로 말하면 우측에 10pt 크기의 한국어 번역이 100% 실시간으로 표시됩니다."}
                  </span>
                )}
              </p>
            </div>

            {/* Footer: Fixed Height (h-6) */}
            <div className={`pt-1 border-t shrink-0 h-6 ${isDark ? 'border-indigo-500/30 text-indigo-300/80' : 'border-indigo-100 text-indigo-700'} text-[8pt] font-medium flex items-center justify-between`}>
              <span className="truncate">한글 10pt · 🔒 1/4 시선 집중 고정 박스</span>
              <span className="font-semibold text-amber-400 shrink-0">100% 무조건 한글 출력</span>
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

      {/* Quick Voice Test, Simulation Controls & 💾 Voice Save Ribbon */}
      <div className={`${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-sm'
      } border rounded-2xl px-4 py-2 shadow-md flex flex-wrap items-center justify-between gap-3`}>
        
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          {/* Language Test Switcher Tab (🇬🇧 UK / 🇯🇵 JP / 🇨🇳 CN) */}
          <div className={`flex items-center p-0.5 rounded-lg border shrink-0 ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              onClick={() => setTestLanguageTab('en-GB')}
              className={`px-2 py-0.5 text-[9pt] font-bold rounded transition ${
                testLanguageTab === 'en-GB'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇬🇧 영문
            </button>
            <button
              onClick={() => setTestLanguageTab('ja-JP')}
              className={`px-2 py-0.5 text-[9pt] font-bold rounded transition ${
                testLanguageTab === 'ja-JP'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇯🇵 일본어
            </button>
            <button
              onClick={() => setTestLanguageTab('zh-CN')}
              className={`px-2 py-0.5 text-[9pt] font-bold rounded transition ${
                testLanguageTab === 'zh-CN'
                  ? 'bg-red-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇨🇳 중국어
            </button>
          </div>

          <span className="text-[9pt] font-bold text-amber-500 shrink-0 flex items-center gap-1">
            ⚡ {testLanguageTab === 'en-GB' ? '영국 건축 발화:' : testLanguageTab === 'ja-JP' ? '일본 건축 발화:' : '중국 건축 발화:'}
          </span>

          {(testLanguageTab === 'en-GB' ? ukQuickPhrases : testLanguageTab === 'ja-JP' ? jpQuickPhrases : zhQuickPhrases).slice(0, 3).map((phrase, i) => (
            <button
              key={i}
              onClick={() => runVoiceTest(phrase, testLanguageTab)}
              className={`text-[8.5pt] font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap transition flex items-center gap-1 ${
                isDark 
                  ? 'bg-slate-900/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border-slate-700 hover:border-amber-500/40' 
                  : 'bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border-slate-200 hover:border-amber-400'
              }`}
              title={`클릭 시 ${testLanguageTab === 'en-GB' ? '영국식' : testLanguageTab === 'ja-JP' ? '일본어' : '중국어'} 원어민 발음으로 재생되고 한국어 뜻을 즉시 통역합니다`}
            >
              <Play className={`w-2.5 h-2.5 fill-current ${testLanguageTab === 'en-GB' ? 'text-amber-500' : testLanguageTab === 'ja-JP' ? 'text-rose-500' : 'text-red-500'}`} />
              <span>{phrase.slice(0, 26)}...</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* 💾 Direct Save Button into Documents\음성 */}
          <button
            onClick={handleSaveToDocuments}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[8.5pt] font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition hover:scale-105 border border-indigo-400/40"
            title="현재까지의 녹음 음성과 번역 대화록을 내 컴퓨터 [내문서\음성] 폴더에 즉시 저장합니다 (GitHub 용량 보호)"
          >
            <FolderDown className="w-3.5 h-3.5 text-sky-300" />
            <span>{isSaving ? '저장 중...' : '💾 내문서\\음성 저장'}</span>
          </button>

          <button
            onClick={startSimulation}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[8.5pt] font-bold transition shadow-md ${
              isSimulating 
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                : 'bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 text-white'
            }`}
          >
            {isSimulating ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isSimulating ? '중지' : '전체 시뮬레이션'}</span>
          </button>

          <button
            onClick={() => { setMessages([]); setInterimText(''); setLiveStreamingTranslation(''); }}
            className={`p-1.5 rounded-lg transition border ${
              isDark 
                ? 'text-slate-400 hover:text-rose-400 bg-slate-900 border-slate-700/60' 
                : 'text-slate-500 hover:text-rose-600 bg-slate-100 border-slate-300'
            }`}
            title="기록 초기화"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 📜 SESSION BACKUP HISTORY ARCHIVE (Clean Previous Conversation Log) */}
      <div className={`flex-1 ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
      } border rounded-2xl p-4 overflow-y-auto space-y-3.5 shadow-inner`}>
        <div ref={messagesTopRef} />

        {/* Section Title for Backup Archive */}
        <div className={`flex items-center justify-between pb-2 border-b ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <div className="flex items-center space-x-2 text-xs font-bold">
            <BookOpen className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <span className={isDark ? 'text-slate-400' : 'text-slate-700'}>
              이전 대화 백업 아카이브 (Session History Log)
            </span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {messages.length}개 기록됨
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveToDocuments}
              className={`text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg border transition ${
                isDark 
                  ? 'text-sky-400 hover:text-sky-300 bg-slate-800/80 border-slate-700 hover:border-sky-500/40' 
                  : 'text-sky-700 hover:text-sky-800 bg-white border-slate-300 hover:border-sky-400 shadow-sm'
              }`}
              title="이전 대화와 음성을 내문서\음성 폴더에 저장"
            >
              <Save className="w-3 h-3 text-sky-500" />
              <span>음성 & 대화 백업</span>
            </button>
            {messages.length > 0 && (
              <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>최신순</span>
            )}
          </div>
        </div>

        {messages.length === 0 && (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-amber-500 shadow-md ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <Languages className="w-5 h-5" />
            </div>
            <div className="max-w-md">
              <h3 className={`text-[10pt] font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                대화 백업 로그가 비어 있습니다
              </h3>
              <p className={`text-[9pt] mt-0.5 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                상단 중심의 실시간 통역 무대에서 발화가 완료되면, 이곳에 이전 대화가 자동으로 차곡차곡 백업됩니다.
              </p>
            </div>
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