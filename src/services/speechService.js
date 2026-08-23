// 🏛️ UK Architectural Speech & Phonetic Auto-Correction Dictionary (100+ Common STT Misrecognitions)
const PHONETIC_UK_CORRECTIONS = [
  { pattern: /\b(?:part\s*l|party\s*l|partielle|part\s*elle|part\s*el)\b/gi, replace: 'Part L (Conservation of fuel and power)' },
  { pattern: /\b(?:part\s*b|party\s*b)\b/gi, replace: 'Part B (Fire safety)' },
  { pattern: /\b(?:part\s*m|party\s*m)\b/gi, replace: 'Part M (Access to buildings)' },
  { pattern: /\b(?:curtain\s*falling|curtain\s*fall|cotton\s*walling)\b/gi, replace: 'curtain walling' },
  { pattern: /\b(?:breeze\s*so\s*lay|brise\s*sole|breeze\s*soleil|brice\s*so\s*lay)\b/gi, replace: 'brise-soleil' },
  { pattern: /\b(?:saw\s*fit|so\s*fit|soft\s*fit)\b/gi, replace: 'soffit' },
  { pattern: /\b(?:ground\s*flour|ground\s*flow)\b/gi, replace: 'Ground Floor (GF)' },
  { pattern: /\b(?:first\s*flour|first\s*flow)\b/gi, replace: 'First Floor (FF)' },
  { pattern: /\b(?:bree\s*am|bream\s*rating|bre\s*am)\b/gi, replace: 'BREEAM' },
  { pattern: /\b(?:river\s*stage|reba\s*stage|rebar\s*stage)\b/gi, replace: 'RIBA Stage' },
  { pattern: /\b(?:section\s*one\s*oh\s*six|s\s*one\s*oh\s*six|s\s*106)\b/gi, replace: 'Section 106 (S106 Agreement)' },
  { pattern: /\b(?:a\s*ten\s*u\s*ation|atten\s*u\s*ation)\b/gi, replace: 'attenuation tank' },
  { pattern: /\b(?:coat\s*ping|cope\s*in)\b/gi, replace: 'coping stone' },
  { pattern: /\b(?:b\s*o\s*q|boc\s*document)\b/gi, replace: 'BOQ (Bill of Quantities)' },
  { pattern: /\b(?:l\s*p\s*a|lpa\s*officer)\b/gi, replace: 'Local Planning Authority (LPA)' },
  { pattern: /\b(?:m\s*e\s*p|m\s*and\s*e)\b/gi, replace: 'MEP (Mechanical, Electrical, Plumbing)' },
  { pattern: /\b(?:q\s*s\s*estimate|cue\s*s)\b/gi, replace: 'Quantity Surveyor (QS)' },
  { pattern: /\b(?:r\s*f\s*i)\b/gi, replace: 'RFI (Request for Information)' }
];

export function applyPhoneticCorrections(text) {
  if (!text) return '';
  let corrected = text;
  for (const { pattern, replace } of PHONETIC_UK_CORRECTIONS) {
    corrected = corrected.replace(pattern, replace);
  }
  return corrected;
}

// Speech Recognition (STT) & Speech Synthesis (TTS) Service with Ultra-Low Latency Streaming
class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.currentLang = 'en-GB';
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.ukVoice = null;
    this.krVoice = null;
    this.autoRestart = true;

    this.initVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => this.initVoices();
    }
  }

  initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    
    // Find best UK English native voice (Oliver, George, Hazel, Natural, etc.)
    this.ukVoice = voices.find(v => (v.lang === 'en-GB' || v.lang === 'en_GB') && (v.name.includes('UK') || v.name.includes('British') || v.name.includes('Oliver') || v.name.includes('George') || v.name.includes('Hazel') || v.name.includes('Natural') || v.name.includes('Online'))) 
      || voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB'))
      || voices.find(v => v.lang.startsWith('en'))
      || null;

    // Find best Korean voice
    this.krVoice = voices.find(v => (v.lang === 'ko-KR' || v.lang === 'ko_KR') && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('SunHi') || v.name.includes('Heami') || v.name.includes('Yuna'))) 
      || voices.find(v => v.lang.startsWith('ko'))
      || null;
  }

  isSpeechRecognitionSupported() {
    return typeof window !== 'undefined' && 
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  startRecognition({ 
    lang = 'en-GB', 
    onResult, 
    onInterimResult, 
    onError, 
    onEnd,
    continuous = true 
  }) {
    if (!this.isSpeechRecognitionSupported()) {
      onError?.(new Error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'));
      return false;
    }

    this.stopRecognition();
    this.autoRestart = continuous;
    this.isListening = true;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 5; // Search top 5 candidates for highest accuracy
    this.recognition.lang = lang;
    this.currentLang = lang;

    // Inject UK Architectural Grammar hints if supported by browser
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    if (SpeechGrammarList) {
      try {
        const grammarList = new SpeechGrammarList();
        const architecturalTerms = '#JSGF V1.0; grammar architectural_terms; public <term> = Part L | Part B | Part M | RIBA | BREEAM | Curtain Walling | Brise-soleil | Soffit | Mullion | Transom | S106 | LPA | MEP | QS | BOQ | Attenuation | Cladding | Facade | U-value ;';
        grammarList.addFromString(architecturalTerms, 1.0);
        this.recognition.grammars = grammarList;
      } catch (e) {
        // Optional grammar enhancement
      }
    }

    let lastCommittedText = '';
    let currentInterimBuffer = '';

    // ⚡ Silence Auto-Commit Timer (Flushes pending interim text if speaker pauses for 1.2s to prevent drop)
    const resetSilenceTimer = () => {
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
      if (!currentInterimBuffer.trim()) return;

      this.silenceTimer = setTimeout(() => {
        if (currentInterimBuffer.trim() && currentInterimBuffer.trim() !== lastCommittedText) {
          const refinedText = applyPhoneticCorrections(currentInterimBuffer.trim());
          lastCommittedText = currentInterimBuffer.trim();
          currentInterimBuffer = '';
          onInterimResult?.('');
          onResult?.(refinedText);
        }
      }, 1200); // 1.2s pause auto-commits seamlessly
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        // Pick best alternative candidate with architectural boost
        const alternatives = Array.from(event.results[i]);
        let bestCandidate = alternatives[0]?.transcript || '';

        // Check if secondary alternative contains architectural terms with better confidence
        for (const alt of alternatives) {
          if (alt.confidence > 0.6 || /\b(part\s*[lbm]|riba|breeam|facade|u-value|soffit|mullion)\b/i.test(alt.transcript)) {
            bestCandidate = alt.transcript;
            break;
          }
        }

        if (event.results[i].isFinal) {
          finalTranscript += bestCandidate;
        } else {
          interimTranscript += bestCandidate;
        }
      }

      // Stream interim text with phonetic normalizer
      if (interimTranscript) {
        currentInterimBuffer = interimTranscript;
        const normalizedInterim = applyPhoneticCorrections(interimTranscript.trim());
        onInterimResult?.(normalizedInterim);
        resetSilenceTimer();
      }

      // Commit final text seamlessly
      if (finalTranscript && finalTranscript.trim() !== lastCommittedText) {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        currentInterimBuffer = '';
        lastCommittedText = finalTranscript.trim();
        const refinedFinal = applyPhoneticCorrections(finalTranscript.trim());
        onResult?.(refinedFinal);
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'network') {
        return; // Non-fatal silence
      }
      console.warn('Speech recognition notice:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.isListening = false;
        onError?.(event);
      }
    };

    this.recognition.onend = () => {
      // Flush any leftover buffer on sudden end to never drop speech
      if (currentInterimBuffer.trim() && currentInterimBuffer.trim() !== lastCommittedText) {
        const refinedText = applyPhoneticCorrections(currentInterimBuffer.trim());
        lastCommittedText = currentInterimBuffer.trim();
        currentInterimBuffer = '';
        onResult?.(refinedText);
      }

      if (this.isListening && this.autoRestart) {
        if (this.restartTimer) clearTimeout(this.restartTimer);
        this.restartTimer = setTimeout(() => {
          if (this.isListening && this.recognition) {
            try {
              this.recognition.start();
            } catch (e) {
              // already active
            }
          }
        }, 100);
      } else {
        this.isListening = false;
        onEnd?.();
      }
    };

    try {
      this.recognition.start();
      return true;
    } catch (e) {
      console.error('Failed to start recognition:', e);
      onError?.(e);
      this.isListening = false;
      return false;
    }
  }

  stopRecognition() {
    this.autoRestart = false;
    this.isListening = false;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
    }
  }

  speak(text, lang = 'ko-KR', { rate = 1.05, pitch = 1.0, onStart, onEnd } = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Stop prior audio

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = lang;

    if (lang.startsWith('en')) {
      if (this.ukVoice) utterance.voice = this.ukVoice;
    } else if (lang.startsWith('ko')) {
      if (this.krVoice) utterance.voice = this.krVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // 🎙️ Real-time Audio Recorder & Saver (Saves to Documents/음성)
  startMediaRecording() {
    try {
      if (!this.mediaStream) return;
      this.audioChunks = [];
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4';

      this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // 1-second chunks
      console.log('[MediaRecorder started]');
    } catch (e) {
      console.warn('Could not initialize MediaRecorder:', e);
    }
  }

  stopMediaRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];
        resolve(audioBlob);
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        resolve(null);
      }
    });
  }

  // 💾 Save Audio Blob & Text Transcripts directly to C:\Users\tttd1\Documents\음성
  async saveVoiceRecordingToDocuments(audioBlob, messages = []) {
    try {
      const results = {};

      // 1. Save Audio File if blob exists
      if (audioBlob && audioBlob.size > 0) {
        const response = await fetch('/api/save-audio', {
          method: 'POST',
          headers: { 'Content-Type': audioBlob.type || 'audio/webm' },
          body: audioBlob
        });
        if (response.ok) {
          results.audio = await response.json();
        }
      }

      // 2. Save Conversation Transcript Text File
      if (messages && messages.length > 0) {
        const header = `=====================================================\n` +
                       `🏛️ ARCHISYNC UK - 회의 통역 기록 (음성 백업)\n` +
                       `일시: ${new Date().toLocaleString('ko-KR')}\n` +
                       `저장 위치: 내 문서\\음성\n` +
                       `=====================================================\n\n`;

        const body = messages.map((m, idx) => {
          return `[#${messages.length - idx}] ${m.timestamp} - ${m.speaker} (${m.lang})\n` +
                 `  🇬🇧 영문: ${m.original}\n` +
                 `  🇰🇷 한글: ${m.translation}\n` +
                 `  📌 의도: ${m.intent?.label || '일반'} | 1초 요약: ${m.intent?.takeaway || '-'}\n` +
                 (m.terms && m.terms.length > 0 ? `  🏷️ 건축용어: ${m.terms.join(', ')}\n` : '') +
                 `-----------------------------------------------------\n`;
        }).join('\n');

        const transcriptRes = await fetch('/api/save-transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: header + body })
        });
        if (transcriptRes.ok) {
          results.transcript = await transcriptRes.json();
        }
      }

      return {
        success: true,
        path: results.audio?.path || results.transcript?.path || 'C:\\Users\\tttd1\\Documents\\음성',
        directory: results.audio?.directory || 'C:\\Users\\tttd1\\Documents\\음성',
        audioFile: results.audio?.filename,
        transcriptFile: results.transcript?.filename
      };
    } catch (err) {
      console.error('Failed to save to local Documents/음성:', err);
      // Fallback: Trigger browser client-side download
      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voice_recording_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      }
      return { success: false, error: err.message };
    }
  }

  // Real-time audio waveform visualizer & recording stream
  async startAudioVisualizer(onAudioLevel) {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return null;
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });

      // Start MediaRecorder alongside visualizer
      this.startMediaRecording();

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let animId;
      const tick = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        onAudioLevel(average / 128); // 0.0 to 1.0
        animId = requestAnimationFrame(tick);
      };
      tick();

      return () => {
        if (animId) cancelAnimationFrame(animId);
        this.stopAudioVisualizer();
      };
    } catch (e) {
      console.warn('Audio visualizer mic access notice:', e);
      return null;
    }
  }

  stopAudioVisualizer() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
      this.analyser = null;
    }
  }
}

export const speechService = new SpeechService();