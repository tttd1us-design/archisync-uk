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
  HelpCircle
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { translateArchitectureText } from '../services/geminiService';
import { findGlossaryMatches } from '../data/architectureGlossary';
import { DEMO_SCENARIOS } from '../data/demoScenarios';

// Smart Sentence & Clause Splitter for Real-Time Interpretation
function splitIntoSentences(text) {
  if (!text || !text.trim()) return [];

  const raw = text.trim();

  // 1. Split on standard punctuation or newlines
  let parts = raw
    .split(/(?<=[.?!])\s+|\n+/)
    .map(s => s.trim())
    .filter(Boolean);

  // 2. If a single part is still very long (more than 10 words without punctuation), split by conversational conjunctions
  const refined = [];
  for (const p of parts) {
    const words = p.split(/\s+/);
    if (words.length > 10) {
      // Split on strong conversational boundaries like ", and ", ", but ", ", so ", ", also "
      const subParts = p.split(/(?<=,)\s+(?=and\b|but\b|so\b|also\b|however\b|therefore\b|please\b)/i)
        .map(s => s.trim())
        .filter(Boolean);
      refined.push(...subParts);
    } else {
      refined.push(p);
    }
  }

  return refined.length > 0 ? refined : [raw];
}

export default function LiveInterpreter({ 
  messages, 
  setMessages, 
  apiKey, 
  selectedScenarioId,
  onSelectedScenarioChange,
  onOpenGlossaryWithTerm
}) {
  const [activeMic, setActiveMic] = useState(null); // 'en-GB' | 'ko-KR' | null
  const [interimText, setInterimText] = useState('');
  const [liveStreamingTranslation, setLiveStreamingTranslation] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [inputLang, setInputLang] = useState('en-GB');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [autoSpeakKorean, setAutoSpeakKorean] = useState(false);

  const messagesTopRef = useRef(null);
  const simulationTimerRef = useRef(null);
  const visualizerCleanupRef = useRef(null);
  const interimTranslateTimerRef = useRef(null);

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

  // Start / Stop Microphone with Real-time Streaming Translation
  const toggleMic = (lang) => {
    if (activeMic === lang) {
      if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);
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
      
      const targetLang = lang === 'en-GB' ? 'ko-KR' : 'en-GB';

      speechService.startRecognition({
        lang: lang,
        continuous: true,
        onInterimResult: (streamText) => {
          setInterimText(streamText);
          
          // Debounce interim translation (180ms) to eliminate flickering and jitter
          if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);
          if (streamText.length > 2) {
            interimTranslateTimerRef.current = setTimeout(async () => {
              const streamTrans = await translateArchitectureText({
                text: streamText,
                sourceLang: lang,
                targetLang: targetLang,
                apiKey: apiKey
              });
              setLiveStreamingTranslation(streamTrans);
            }, 180);
          }
        },
        onResult: async (finalText) => {
          if (!finalText.trim()) return;
          if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);

          // Split long spoken text into clean, individual sentences
          const sentences = splitIntoSentences(finalText);

          for (const sentence of sentences) {
            if (!sentence.trim()) continue;

            const translated = await translateArchitectureText({
              text: sentence,
              sourceLang: lang,
              targetLang: targetLang,
              apiKey: apiKey
            });

            const matchedTerms = findGlossaryMatches(sentence);

            const newMessage = {
              id: Date.now() + Math.random(),
              speaker: lang === 'en-GB' ? 'UK Lead Architect' : 'Seoul Design Lead',
              speakerRole: lang === 'en-GB' ? 'UK Architect' : 'KR Director',
              lang: lang,
              accent: lang === 'en-GB' ? 'UK (London RP)' : 'Korean',
              original: sentence,
              translation: translated,
              terms: matchedTerms.map(t => t.term),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };

            // Put each concise sentence at the TOP
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

  // Handle Manual Text Submission with Sentence-by-Sentence Breakdown
  const handleManualSend = async (e) => {
    e?.preventDefault();
    if (!customInput.trim()) return;

    const sourceLang = inputLang;
    const targetLang = sourceLang === 'en-GB' ? 'ko-KR' : 'en-GB';
    const textToSend = customInput;
    setCustomInput('');

    const sentences = splitIntoSentences(textToSend);

    for (const sentence of sentences) {
      if (!sentence.trim()) continue;

      const translated = await translateArchitectureText({
        text: sentence,
        sourceLang: sourceLang,
        targetLang: targetLang,
        apiKey: apiKey
      });

      const matchedTerms = findGlossaryMatches(sentence);

      const newMessage = {
        id: Date.now() + Math.random(),
        speaker: sourceLang === 'en-GB' ? 'UK Lead Architect' : 'Seoul Design Lead',
        speakerRole: sourceLang === 'en-GB' ? 'UK Architect' : 'KR Director',
        lang: sourceLang,
        accent: sourceLang === 'en-GB' ? 'UK (London RP)' : 'Korean',
        original: sentence,
        translation: translated,
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
        setMessages(prev => [{
          ...item,
          id: Date.now() + idx,
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

    setMessages(prev => [{
      id: Date.now(),
      speaker: 'UK Lead Architect (Oliver)',
      speakerRole: 'UK Architect',
      lang: 'en-GB',
      accent: 'UK (London RP)',
      original: testEnglishSentence,
      translation: translated,
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
      
      {/* 🚀 LIVE STREAMING TRANSLATION HUD BANNER (Top Prominent Display) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className={`relative inline-flex rounded-full h-3 w-3 ${activeMic ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            </span>
            <span className="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>실시간 초고속 통역 HUD (Live English ➔ Korean Stream)</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSpeakKorean}
                onChange={(e) => setAutoSpeakKorean(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-700"
              />
              <span className="flex items-center gap-1 text-[11px]">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" /> 한국어 음성 동시 출력
              </span>
            </label>
          </div>
        </div>

        {/* Live Audio / Subtitle Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center min-h-[52px]">
          
          {/* English Spoken Stream */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 shrink-0">🇬🇧 영국 영어:</span>
            <p className="text-xs text-slate-200 font-medium truncate">
              {interimText || (messages[messages.length - 1]?.lang?.startsWith('en') ? messages[messages.length - 1]?.original : "영국인 음성 대기 중... (하단 마이크를 켜거나 예시 버튼을 누르세요)")}
            </p>
          </div>

          {/* Korean Instant Translation */}
          <div className="bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-500/40 flex items-center gap-2">
            <span className="text-xs font-bold text-sky-400 shrink-0">🇰🇷 한국어 뜻:</span>
            <p className="text-xs font-bold text-amber-300 truncate">
              {liveStreamingTranslation || (messages[messages.length - 1]?.lang?.startsWith('en') ? messages[messages.length - 1]?.translation : "영어로 말하면 즉시 한국어 뜻이 실시간 표시됩니다.")}
            </p>
          </div>

        </div>
      </div>

      {/* Quick Voice Test & Simulation Controls Ribbon */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          <span className="text-[11px] font-bold text-amber-400 shrink-0 flex items-center gap-1">
            ⚡ 원터치 영국 음성 테스트:
          </span>
          {ukQuickPhrases.slice(0, 3).map((phrase, i) => (
            <button
              key={i}
              onClick={() => runVoiceTest(phrase)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 whitespace-nowrap transition flex items-center gap-1"
              title="클릭 시 영국식 발음으로 재생되고 한국어 뜻을 즉시 통역합니다"
            >
              <Play className="w-2.5 h-2.5 fill-current text-amber-400" />
              <span>{phrase.slice(0, 32)}...</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startSimulation}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md ${
              isSimulating 
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                : 'bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 text-white'
            }`}
          >
            {isSimulating ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isSimulating ? '시뮬레이션 중지' : '전체 회의 시뮬레이션'}</span>
          </button>

          <button
            onClick={() => { setMessages([]); setInterimText(''); setLiveStreamingTranslation(''); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-700/60 transition"
            title="기록 초기화"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main Conversation Stream (Newest First at Top) */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-inner">
        <div ref={messagesTopRef} />

        {/* 🌟 Live Interim Speech Bubble (Pinned at the TOP for Immediate Real-Time Viewing) */}
        {interimText && (
          <div className={`flex flex-col ${activeMic === 'en-GB' ? 'items-start' : 'items-end'} w-full transition-opacity duration-150`}>
            <div className="w-full max-w-3xl bg-slate-950/95 border-2 border-amber-400 rounded-2xl p-4 text-slate-200 shadow-2xl space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-black text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>{activeMic === 'en-GB' ? '🇬🇧 실시간 영국 음성 인식 중 (Speaking)' : '🇰🇷 실시간 한국어 음성 인식 중'}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  실시간 스트리밍
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">"{interimText}"</p>
              {liveStreamingTranslation && (
                <div className="bg-slate-900/90 p-3 rounded-xl text-xs font-bold text-amber-300 border border-slate-700/80 shadow-inner flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>실시간 번역: {liveStreamingTranslation}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {messages.length === 0 && !interimText && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shadow-xl">
              <Languages className="w-7 h-7" />
            </div>
            <div className="max-w-md">
              <h3 className="text-base font-bold text-slate-200">
                영국 현지 건축가와의 실시간 통역 준비
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                하단의 <strong className="text-amber-400">🇬🇧 영국 마이크 켜기</strong>를 누르면 말하는 즉시 한국어 뜻을 알려줍니다. 새롭게 발화되는 내용은 항상 <strong>화면 맨 위</strong>에 표시됩니다.
              </p>
            </div>
          </div>
        )}

        {/* Message Bubble List (Newest on Top) */}
        {messages.map((msg) => {
          const isUK = msg.lang === 'en-GB' || msg.lang?.startsWith('en');
          return (
            <div 
              key={msg.id}
              className={`flex flex-col ${isUK ? 'items-start' : 'items-end'} transition-all`}
            >
              <div className={`max-w-3xl rounded-2xl p-4 shadow-lg border ${
                isUK 
                  ? 'bg-slate-800/95 border-amber-500/40 text-slate-100' 
                  : 'bg-indigo-950/40 border-indigo-500/40 text-slate-100'
              }`}>
                
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/50 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{isUK ? '🇬🇧' : '🇰🇷'}</span>
                    <span className="text-xs font-bold text-slate-200">{msg.speaker}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">
                      {msg.accent}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <span className="text-[10px]">{msg.timestamp}</span>
                    <button
                      onClick={() => playSpeech(msg.original, msg.lang)}
                      className="p-1 hover:text-amber-400 rounded transition"
                      title="원문 다시 듣기"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(msg.id, `${msg.original}\n${msg.translation}`)}
                      className="p-1 hover:text-white rounded transition"
                      title="복사"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Original */}
                <div className="text-sm font-medium leading-relaxed mb-2 text-slate-200">
                  {msg.original}
                </div>

                {/* Instant Translation */}
                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/70 text-sm font-semibold flex items-start justify-between gap-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className={isUK ? 'text-amber-300' : 'text-sky-300'}>
                      {msg.translation}
                    </span>
                  </div>
                  <button
                    onClick={() => playSpeech(msg.translation, isUK ? 'ko-KR' : 'en-GB')}
                    className="p-1 hover:text-amber-400 text-slate-400 shrink-0 rounded transition"
                    title="번역 음성 듣기"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Detected Terms */}
                {msg.terms && msg.terms.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-amber-400" /> 영국 건축 전문 용어:
                    </span>
                    {msg.terms.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => onOpenGlossaryWithTerm(term)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition flex items-center gap-1"
                      >
                        {term}
                        <Info className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Microphone & Text Input Dock */}
      <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-3 shadow-2xl backdrop-blur-md">
        
        {/* Audio Wave Visualizer */}
        {activeMic && (
          <div className="mb-2 px-2 flex items-center justify-center space-x-1.5 h-3">
            {[...Array(24)].map((_, i) => (
              <span 
                key={i}
                className={`w-1 rounded-full transition-all duration-75 ${
                  activeMic === 'en-GB' ? 'bg-amber-400' : 'bg-indigo-400'
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
          
          {/* UK Mic Button */}
          <button
            onClick={() => toggleMic('en-GB')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
              activeMic === 'en-GB'
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30'
                : 'bg-slate-900 hover:bg-slate-700 text-amber-400 border border-amber-500/40'
            }`}
          >
            {activeMic === 'en-GB' ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            <span>{activeMic === 'en-GB' ? '⏹️ 🇬🇧 영국 마이크 끄기 (ON)' : '🎙️ 🇬🇧 영국 마이크 켜기 (OFF)'}</span>
          </button>

          {/* KR Mic Button */}
          <button
            onClick={() => toggleMic('ko-KR')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
              activeMic === 'ko-KR'
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30'
                : 'bg-slate-900 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40'
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
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setInputLang(prev => prev === 'en-GB' ? 'ko-KR' : 'en-GB')}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
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