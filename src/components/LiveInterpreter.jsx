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
import { translateArchitectureText, detectMeetingIntent } from '../services/geminiService';
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

  const messagesTopRef = useRef(null);
  const simulationTimerRef = useRef(null);
  const visualizerCleanupRef = useRef(null);
  const interimTranslateTimerRef = useRef(null);

  // 💾 Handle Direct Saving to C:\Users\tttd1\Documents\음성
  const handleSaveToDocuments = async () => {
    setIsSaving(true);
    try {
      const audioBlob = await speechService.stopMediaRecording();
      const res = await speechService.saveVoiceRecordingToDocuments(audioBlob, messages);
      
      // Resume recording if mic is still active
      if (activeMic) {
        speechService.startMediaRecording();
      }

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
        const targetLang = lang.startsWith('en') ? 'ko-KR' : 'en-GB';
        const pendingText = interimText.trim();
        const translated = await translateArchitectureText({
          text: pendingText,
          sourceLang: lang,
          targetLang: targetLang,
          apiKey: apiKey
        });
        const matchedTerms = findGlossaryMatches(pendingText);
        const intent = detectMeetingIntent(pendingText, translated);

        setMessages(prev => [{
          id: Date.now() + Math.random(),
          speaker: lang.startsWith('en') ? 'UK Lead Architect' : 'Seoul Design Lead',
          speakerRole: lang.startsWith('en') ? 'UK Architect' : 'KR Director',
          lang: lang,
          accent: lang === 'en-GB' ? 'UK (London RP)' : lang === 'en-US' ? 'US (General)' : 'Korean',
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
      
      const targetLang = lang.startsWith('en') ? 'ko-KR' : 'en-GB';

      speechService.startRecognition({
        lang: lang,
        continuous: true,
        onInterimResult: (streamText) => {
          setInterimText(streamText);
          
          // Ultra-fast 80ms interim translation for instantaneous feedback
          if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);
          if (streamText.length > 1) {
            interimTranslateTimerRef.current = setTimeout(async () => {
              const streamTrans = await translateArchitectureText({
                text: streamText,
                sourceLang: lang,
                targetLang: targetLang,
                apiKey: apiKey
              });
              setLiveStreamingTranslation(streamTrans);
            }, 80);
          }
        },
        onResult: async (finalText) => {
          if (!finalText.trim()) return;
          if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);

          // Split spoken text into intelligible, clear chunks (4-7 words)
          const chunks = splitIntoIntelligibleChunks(finalText);

          for (const chunk of chunks) {
            if (!chunk.trim()) continue;

            const translated = await translateArchitectureText({
              text: chunk,
              sourceLang: lang,
              targetLang: targetLang,
              apiKey: apiKey
            });

            const matchedTerms = findGlossaryMatches(chunk);
            const intent = detectMeetingIntent(chunk, translated);

            const newMessage = {
              id: Date.now() + Math.random(),
              speaker: lang.startsWith('en') ? 'UK Lead Architect' : 'Seoul Design Lead',
              speakerRole: lang.startsWith('en') ? 'UK Architect' : 'KR Director',
              lang: lang,
              accent: lang === 'en-GB' ? 'UK (London RP)' : lang === 'en-US' ? 'US (General)' : 'Korean',
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
        onError: (err) => {
          console.warn('Speech recognition status:', err);
        },
        onEnd: () => {
          // Handled safely in speechService
        }
      });
    }
  };

  // Handle Manual Text Submission with Intelligible Breakdown
  const handleManualSend = async (e) => {
    e?.preventDefault();
    if (!customInput.trim()) return;

    const sourceLang = inputLang;
    const targetLang = sourceLang === 'en-GB' ? 'ko-KR' : 'en-GB';
    const textToSend = customInput;
    setCustomInput('');

    const chunks = splitIntoIntelligibleChunks(textToSend);

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;

      const translated = await translateArchitectureText({
        text: chunk,
        sourceLang: sourceLang,
        targetLang: targetLang,
        apiKey: apiKey
      });

      const matchedTerms = findGlossaryMatches(chunk);
      const intent = detectMeetingIntent(chunk, translated);

      const newMessage = {
        id: Date.now() + Math.random(),
        speaker: sourceLang === 'en-GB' ? 'UK Lead Architect' : 'Seoul Design Lead',
        speakerRole: sourceLang === 'en-GB' ? 'UK Architect' : 'KR Director',
        lang: sourceLang,
        accent: sourceLang === 'en-GB' ? 'UK (London RP)' : 'Korean',
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

  // One-touch Native English Voice Test
  const runVoiceTest = async (testEnglishSentence) => {
    // 1. Speak in UK native voice
    speechService.speak(testEnglishSentence, 'en-GB');

    // 2. Immediately translate and post
    const translated = await translateArchitectureText({
      text: testEnglishSentence,
      sourceLang: 'en-GB',
      targetLang: 'ko-KR',
      apiKey: apiKey
    });

    const matchedTerms = findGlossaryMatches(testEnglishSentence);
    const intent = detectMeetingIntent(testEnglishSentence, translated);

    setMessages(prev => [{
      id: Date.now(),
      speaker: 'UK Lead Architect (Oliver)',
      speakerRole: 'UK Architect',
      lang: 'en-GB',
      accent: 'UK (London RP)',
      original: testEnglishSentence,
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
    "Make sure the cavity barriers comply with Part B fire safety standards.",
    "We need to serve the Party Wall notices to adjoining neighbours this week."
  ];

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
                🇬🇧 ➔ 🇰🇷 실시간 듀얼 트랙
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
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
                <Volume2 className="w-4 h-4 text-amber-500" /> 한국어 음성 동시 출력 (TTS)
              </span>
            </label>
          </div>
        </div>

        {/* 🌟 CENTRAL LIVE REAL-TIME STAGE (Single Focus: Left English 12pt 🇬🇧 | Right Korean 10pt 🇰🇷) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          
          {/* ⬅️ LEFT SCREEN: Live Spoken English (Fixed 12pt - Focus Stage) */}
          <div className={`${
            isDark 
              ? 'bg-slate-950/90 border-2 border-slate-700/90 text-slate-100' 
              : 'bg-white border-2 border-slate-300 text-slate-900 shadow-md'
          } p-4 rounded-2xl flex flex-col justify-between shadow-xl space-y-2.5 transition-colors`}>
            <div className={`flex items-center justify-between pb-2 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <span className="text-[10.5pt] font-extrabold text-amber-500 flex items-center gap-1.5">
                🇬🇧 실시간 영국 영어 (Live English Speech)
              </span>
              <span className={`text-[8.5pt] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeMic === 'en-GB' 
                  ? 'bg-amber-500/20 text-amber-600 border border-amber-500/40 animate-pulse' 
                  : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}>
                {activeMic === 'en-GB' ? '🎙️ 실시간 수신 중' : '마이크 대기 중'}
              </span>
            </div>
            
            <div className="flex-1 flex items-center min-h-[56px] py-1">
              <p className={`text-[12pt] font-semibold leading-relaxed font-sans select-text ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                {interimText ? (
                  <span className={`${isDark ? 'text-white' : 'text-slate-950 font-bold'} drop-shadow-sm`}>
                    "{interimText}"
                  </span>
                ) : (
                  <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'} font-normal italic`}>
                    {messages[0]?.lang?.startsWith('en') 
                      ? `"${messages[0]?.original}"` 
                      : "영국인 음성을 실시간 수신합니다. (하단 마이크를 켜거나 테스트 버튼을 누르세요)"}
                  </span>
                )}
              </p>
            </div>

            <div className={`pt-1.5 border-t ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'} text-[8.5pt] font-medium flex items-center justify-between`}>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${activeMic ? 'bg-amber-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                <span>영문 12pt 고정 · 호흡/의미절 단위 스마트 분할</span>
              </span>
              {interimText && (
                <span className="text-amber-500 font-mono text-[8pt]">Live Transcribing...</span>
              )}
            </div>
          </div>

          {/* ➡️ RIGHT SCREEN: Live Instant Korean Translation (Fixed 10pt - Focus Stage) */}
          <div className={`${
            isDark 
              ? 'bg-indigo-950/70 border-2 border-indigo-500/60 text-amber-300' 
              : 'bg-indigo-50/90 border-2 border-indigo-400/80 text-indigo-950 shadow-md'
          } p-4 rounded-2xl flex flex-col justify-between shadow-xl space-y-2.5 transition-colors`}>
            <div className={`flex items-center justify-between pb-2 border-b ${
              isDark ? 'border-indigo-500/30' : 'border-indigo-200'
            }`}>
              <span className={`text-[10.5pt] font-extrabold flex items-center gap-1.5 ${
                isDark ? 'text-sky-300' : 'text-indigo-700'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 🇰🇷 실시간 초고속 한글 뜻 (Instant Korean)
              </span>
              <span className={`text-[8.5pt] font-bold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                ⚡ 0.1초 즉시 번역
              </span>
            </div>

            <div className="flex-1 flex items-center min-h-[56px] py-1">
              <p className={`text-[10pt] font-bold leading-relaxed select-text ${
                isDark ? 'text-amber-300' : 'text-indigo-950 font-extrabold'
              }`}>
                {liveStreamingTranslation ? (
                  <span>{liveStreamingTranslation}</span>
                ) : (
                  <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-normal`}>
                    {messages[0]?.lang?.startsWith('en') 
                      ? messages[0]?.translation 
                      : "영어로 말하면 즉시 10pt 크기의 한국어 뜻이 실시간 표시됩니다."}
                  </span>
                )}
              </p>
            </div>

            <div className={`pt-1.5 border-t ${isDark ? 'border-indigo-500/20 text-sky-300' : 'border-indigo-200 text-indigo-700'} text-[8.5pt] font-medium flex items-center justify-between`}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>한글 10pt 고정 · 영국 건축 용어 3,000+ 자동 보정</span>
              </span>
              {liveStreamingTranslation && (
                <span className={`${isDark ? 'text-sky-300' : 'text-indigo-600'} font-mono text-[8pt]`}>Auto Syncing...</span>
              )}
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
          <span className="text-[9.5pt] font-bold text-amber-500 shrink-0 flex items-center gap-1">
            ⚡ 원터치 영국 음성 테스트:
          </span>
          {ukQuickPhrases.slice(0, 3).map((phrase, i) => (
            <button
              key={i}
              onClick={() => runVoiceTest(phrase)}
              className={`text-[8.5pt] font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap transition flex items-center gap-1 ${
                isDark 
                  ? 'bg-slate-900/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border-slate-700 hover:border-amber-500/40' 
                  : 'bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border-slate-200 hover:border-amber-400'
              }`}
              title="클릭 시 영국식 발음으로 재생되고 한국어 뜻을 즉시 통역합니다"
            >
              <Play className="w-2.5 h-2.5 fill-current text-amber-500" />
              <span>{phrase.slice(0, 32)}...</span>
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

        {/* Previous Message Backup Cards (Left English 12pt | Right Korean 10pt) */}
        {messages.map((msg) => {
          const isUK = msg.lang === 'en-GB' || msg.lang?.startsWith('en');
          const intent = msg.intent || {
            type: 'INFO',
            label: '💬 현황 공유',
            color: isDark ? 'bg-slate-700/50 text-slate-300 border-slate-600/40' : 'bg-slate-100 text-slate-700 border-slate-300',
            borderLeft: 'border-l-4 border-l-indigo-500',
            takeaway: '대화 내용 확인'
          };

          return (
            <div key={msg.id} className="w-full transition-all">
              <div className={`w-full rounded-2xl p-3.5 shadow-md border ${intent.borderLeft} ${
                isDark ? 'bg-slate-950/80 border-slate-800/80 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              } space-y-2.5`}>
                
                {/* 1. Backup Card Top Bar */}
                <div className={`flex flex-wrap items-center justify-between pb-1.5 border-b ${
                  isDark ? 'border-slate-800/60' : 'border-slate-100'
                } gap-2`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{isUK ? '🇬🇧' : '🇰🇷'}</span>
                    <span className={`text-[9.5pt] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{msg.speaker}</span>
                    <span className={`text-[8pt] font-bold px-2 py-0.5 rounded-full border ${intent.color}`}>
                      {intent.label}
                    </span>
                  </div>
                  
                  <div className={`flex items-center space-x-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="text-[8pt] font-mono">{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopy(msg.id, `[영문] ${msg.original}\n[한글] ${msg.translation}`)}
                      className="p-1 hover:text-amber-500 rounded transition"
                      title="전체 복사"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 2. Dual Column Layout: Left English 12pt 🇬🇧 | Right Korean 10pt 🇰🇷 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                  
                  {/* ⬅️ LEFT COLUMN: English Spoken Sentence (Fixed 12pt) */}
                  <div className={`${
                    isDark ? 'bg-slate-900/90 border-slate-800/90' : 'bg-slate-50 border-slate-200'
                  } rounded-xl p-3 border flex flex-col justify-between space-y-2`}>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8.5pt] font-bold flex items-center gap-1 ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          🇬🇧 영문 (English):
                        </span>
                        <button
                          onClick={() => playSpeech(msg.original, msg.lang)}
                          className="p-1 hover:text-amber-500 text-slate-400 transition flex items-center gap-1 text-[8.5pt]"
                          title="영문 원문 다시 듣기"
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
                            onClick={() => onOpenGlossaryWithTerm(term)}
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
                        <span className={`text-[8.5pt] font-bold flex items-center gap-1 ${
                          isDark ? 'text-sky-300' : 'text-indigo-700'
                        }`}>
                          <Sparkles className="w-3 h-3 text-amber-500" /> 🇰🇷 한글 번역 (Korean):
                        </span>
                        <button
                          onClick={() => playSpeech(msg.translation, isUK ? 'ko-KR' : 'en-GB')}
                          className="p-1 hover:text-amber-500 text-sky-500 transition flex items-center gap-1 text-[8.5pt]"
                          title="한국어 번역 음성 듣기"
                        >
                          <Volume2 className="w-3 h-3 text-sky-500" />
                          <span>번역 듣기</span>
                        </button>
                      </div>
                      
                      <p className={`text-[10pt] font-bold leading-relaxed select-text ${
                        isDark ? 'text-amber-300' : 'text-indigo-950 font-extrabold'
                      }`}>
                        {msg.translation}
                      </p>
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
        })}
      </div>

      {/* Bottom Microphone & Text Input Dock */}
      <div className={`${
        isDark ? 'bg-slate-800/90 border-slate-700/90' : 'bg-white border-slate-200 shadow-xl'
      } border rounded-2xl p-3 shadow-2xl backdrop-blur-md transition-colors`}>
        
        {/* Audio Wave Visualizer */}
        {activeMic && (
          <div className="mb-2 px-2 flex items-center justify-center space-x-1.5 h-3">
            {[...Array(24)].map((_, i) => (
              <span 
                key={i}
                className={`w-1 rounded-full transition-all duration-75 ${
                  activeMic === 'en-GB' ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{
                  height: `${Math.max(4, Math.min(18, (audioLevel * 32 * (1 + Math.sin(i * 0.7)))))}px`,
                  opacity: 0.4 + audioLevel * 0.6
                }}
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          
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
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
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
                  ? `⏹️ ${selectedEnglishAccent === 'en-GB' ? '🇬🇧 영국' : '🇺🇸 미국'} 마이크 끄기 (ON)` 
                  : `🎙️ ${selectedEnglishAccent === 'en-GB' ? '🇬🇧 영국' : '🇺🇸 미국'} 마이크 켜기 (OFF)`}
              </span>
            </button>
          </div>

          {/* KR Mic Button */}
          <button
            onClick={() => toggleMic('ko-KR')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
              activeMic === 'ko-KR'
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30'
                : isDark 
                  ? 'bg-slate-900 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40' 
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300'
            }`}
          >
            {activeMic === 'ko-KR' ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            <span>{activeMic === 'ko-KR' ? '⏹️ 🇰🇷 한국어 마이크 끄기 (ON)' : '🎙️ 🇰🇷 한국어 마이크 켜기 (OFF)'}</span>
          </button>

          {/* Manual Input Field */}
          <form onSubmit={handleManualSend} className="flex-1 flex items-center gap-2 min-w-[280px]">
            <div className="relative flex-1">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={
                  inputLang === 'en-GB' 
                    ? "영어로 입력 시 한국어 뜻 즉시 번역 (e.g. Curtain wall U-value Part L...)" 
                    : "한국어 입력 시 영국 건축 영어로 번역..."
                }
                className={`w-full border rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setInputLang(prev => prev === 'en-GB' ? 'ko-KR' : 'en-GB')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold rounded border ${
                  isDark ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700' : 'bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
                }`}
              >
                {inputLang === 'en-GB' ? '🇬🇧 EN' : '🇰🇷 KO'}
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