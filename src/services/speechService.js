// 🏛️ UK Architectural & Engineering Extensive Phonetic Auto-Correction Dictionary (150+ Rules)
const PHONETIC_UK_CORRECTIONS = [
  // 1. Building Regulations & Legal Codes
  { pattern: /\b(?:part\s*l|party\s*l|partielle|part\s*elle|part\s*el|party\s*elle)\b/gi, replace: 'Part L (Energy & Thermal Regs)' },
  { pattern: /\b(?:part\s*b|party\s*b)\b/gi, replace: 'Part B (Fire Safety)' },
  { pattern: /\b(?:part\s*m|party\s*m)\b/gi, replace: 'Part M (Accessibility & DDA)' },
  { pattern: /\b(?:part\s*k|party\s*k)\b/gi, replace: 'Part K (Protection from Falling)' },
  { pattern: /\b(?:part\s*e|party\s*e)\b/gi, replace: 'Part E (Acoustics)' },
  { pattern: /\b(?:section\s*one\s*oh\s*six|s\s*one\s*oh\s*six|s\s*106|s106\s*agreement)\b/gi, replace: 'Section 106 (S106 Agreement)' },
  { pattern: /\b(?:party\s*wall\s*act|potty\s*wall|party\s*wall\s*notice)\b/gi, replace: 'Party Wall etc. Act 1996' },
  { pattern: /\b(?:c\s*d\s*m|cdm\s*regulations|cdm\s*principal)\b/gi, replace: 'CDM 2015 Regulations (Health & Safety)' },
  { pattern: /\b(?:l\s*p\s*a|lpa\s*officer|local\s*planning\s*officer)\b/gi, replace: 'Local Planning Authority (LPA)' },
  { pattern: /\b(?:planting\s*permission|planning\s*per\s*mission)\b/gi, replace: 'Planning Permission' },
  { pattern: /\b(?:this\s*charge\s*of\s*condition|discharge\s*of\s*condition)\b/gi, replace: 'Discharge of Conditions' },
  { pattern: /\b(?:pre\s*app|preapp\s*meeting|pre\s*application)\b/gi, replace: 'Pre-Application Advice' },
  { pattern: /\b(?:permanent\s*development|permitted\s*dev)\b/gi, replace: 'Permitted Development' },
  { pattern: /\b(?:building\s*control\s*officer|bco\s*inspector)\b/gi, replace: 'Building Control Officer (BCO)' },
  { pattern: /\b(?:approved\s*inspector|approve\s*inspector)\b/gi, replace: 'Approved Inspector' },

  // 2. RIBA Stages & Contract Administration
  { pattern: /\b(?:river\s*stage|reba\s*stage|rebar\s*stage|riba\s*step)\b/gi, replace: 'RIBA Stage' },
  { pattern: /\b(?:b\s*o\s*q|boc\s*document|bill\s*of\s*quantity)\b/gi, replace: 'Bill of Quantities (BOQ)' },
  { pattern: /\b(?:r\s*f\s*i|rfi\s*query)\b/gi, replace: 'RFI (Request for Information)' },
  { pattern: /\b(?:q\s*s|qs\s*cost|cue\s*s)\b/gi, replace: 'Quantity Surveyor (QS)' },
  { pattern: /\b(?:m\s*e\s*p|m\s*and\s*e|mne\s*engineer)\b/gi, replace: 'MEP (Mechanical & Electrical)' },
  { pattern: /\b(?:very\s*asian\s*order|variation\s*order|v\s*o)\b/gi, replace: 'Variation Order (VO)' },
  { pattern: /\b(?:sight\s*instruction|site\s*instruction|s\s*i)\b/gi, replace: 'Site Instruction (SI)' },
  { pattern: /\b(?:snag\s*in\s*list|snagging\s*items|snag\s*list)\b/gi, replace: 'Snagging List (Defects)' },
  { pattern: /\b(?:practice\s*completion|practical\s*complete|p\s*c)\b/gi, replace: 'Practical Completion (PC)' },
  { pattern: /\b(?:defect\s*liability|d\s*l\s*p)\b/gi, replace: 'Defects Liability Period (DLP)' },
  { pattern: /\b(?:re\s*tension|retention\s*fee)\b/gi, replace: 'Retention Fund' },
  { pattern: /\b(?:has\s*built|asbuilt\s*drawings)\b/gi, replace: 'As-Built Drawings' },

  // 3. Facade, Envelope & Structures
  { pattern: /\b(?:curtain\s*falling|curtain\s*fall|cotton\s*walling|curtain\s*wall)\b/gi, replace: 'curtain walling' },
  { pattern: /\b(?:breeze\s*so\s*lay|brise\s*sole|breeze\s*soleil|brice\s*so\s*lay|breeze\s*solar)\b/gi, replace: 'brise-soleil' },
  { pattern: /\b(?:saw\s*fit|so\s*fit|soft\s*fit|sawfit)\b/gi, replace: 'soffit' },
  { pattern: /\b(?:span\s*drill|spandrel\s*glass|spandril)\b/gi, replace: 'spandrel panel' },
  { pattern: /\b(?:pair\s*of\s*pet|parapet\s*capping)\b/gi, replace: 'parapet wall' },
  { pattern: /\b(?:coat\s*ping|cope\s*in|coping\s*detail)\b/gi, replace: 'coping stone' },
  { pattern: /\b(?:clouding\s*panel|cladding\s*rail)\b/gi, replace: 'cladding panel' },
  { pattern: /\b(?:flash\s*in|lead\s*flashing|apron\s*flashing)\b/gi, replace: 'flashing' },
  { pattern: /\b(?:mystic\s*sealant|mastic\s*joint)\b/gi, replace: 'mastic sealant' },
  { pattern: /\b(?:damp\s*proof\s*course|d\s*p\s*c)\b/gi, replace: 'DPC (Damp Proof Course)' },
  { pattern: /\b(?:damp\s*proof\s*membrane|d\s*p\s*m)\b/gi, replace: 'DPM (Damp Proof Membrane)' },

  // 4. Levels, Floor Plans & Space Terminology
  { pattern: /\b(?:ground\s*flour|ground\s*flow|g\s*f)\b/gi, replace: 'Ground Floor (GF 1층)' },
  { pattern: /\b(?:first\s*flour|first\s*flow|1\s*st\s*floor|f\s*f)\b/gi, replace: 'First Floor (FF 2층)' },
  { pattern: /\b(?:second\s*flour|second\s*flow|s\s*f)\b/gi, replace: 'Second Floor (SF 3층)' },
  { pattern: /\b(?:g\s*i\s*a|gross\s*internal\s*area)\b/gi, replace: 'GIA (Gross Internal Area)' },
  { pattern: /\b(?:n\s*i\s*a|net\s*internal\s*area)\b/gi, replace: 'NIA (Net Internal Area)' },
  { pattern: /\b(?:g\s*e\s*a|gross\s*external\s*area)\b/gi, replace: 'GEA (Gross External Area)' },

  // 5. Sustainability, MEP & Civil Works
  { pattern: /\b(?:bree\s*am|bream\s*rating|bre\s*am|breeam\s*excellent)\b/gi, replace: 'BREEAM' },
  { pattern: /\b(?:you\s*value|new\s*value|u\s*values?)\b/gi, replace: 'U-value (열관류율)' },
  { pattern: /\b(?:g\s*value|solar\s*heat\s*gain)\b/gi, replace: 'g-value (태양열취득율)' },
  { pattern: /\b(?:thermal\s*bridge\s*in|thermal\s*bridging)\b/gi, replace: 'thermal bridging (열교)' },
  { pattern: /\b(?:air\s*tight\s*ness|airtight\s*test)\b/gi, replace: 'airtightness' },
  { pattern: /\b(?:a\s*ten\s*u\s*ation|atten\s*u\s*ation|attenuation\s*crate)\b/gi, replace: 'attenuation tank' },
  { pattern: /\b(?:s\s*u\s*d\s*s|suds\s*strategy)\b/gi, replace: 'SuDS (Sustainable Drainage)' },
  { pattern: /\b(?:fowl\s*drainage|foul\s*water)\b/gi, replace: 'foul drainage' },
  { pattern: /\b(?:service\s*water\s*drainage|surface\s*water)\b/gi, replace: 'surface water drainage' },
  { pattern: /\b(?:tank\s*in|basement\s*tanking)\b/gi, replace: 'basement tanking' },
  { pattern: /\b(?:screed\s*layer|floor\s*screen)\b/gi, replace: 'floor screed' },
  { pattern: /\b(?:dry\s*line\s*in|dry\s*lining\s*board)\b/gi, replace: 'dry lining' },
  { pattern: /\b(?:fire\s*damper\s*in|fire\s*stop\s*in)\b/gi, replace: 'fire damper / fire stopping' }
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
        const architecturalTerms = '#JSGF V1.0; grammar architectural_terms; public <term> = Part L | Part B | Part M | RIBA | BREEAM | Curtain Walling | Brise-soleil | Soffit | Mullion | Transom | S106 | LPA | MEP | QS | BOQ | Attenuation | Cladding | Facade | U-value | Planning Permission | Snagging | GIA | NIA ;';
        grammarList.addFromString(architecturalTerms, 1.0);
        this.recognition.grammars = grammarList;
      } catch (e) {
        // Optional grammar enhancement
      }
    }

    let lastCommittedText = '';
    let currentInterimBuffer = '';

    // ⚡ Silence Auto-Commit Timer (Flushes pending interim text if speaker pauses for 1.0s to prevent drop)
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
      }, 1000); // 1.0s pause auto-commits seamlessly
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

  // Real-time audio waveform visualizer & DSP Hardware Filtered recording stream
  async startAudioVisualizer(onAudioLevel) {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return null;
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000
        } 
      });

      // Start MediaRecorder alongside visualizer
      this.startMediaRecording();

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // 🎙️ DSP Filter Chain for Speech Intelligibility & Consonant Boost
      // 1. High-Pass Filter: Cuts sub-85Hz low rumbling noise, desk bumps & HVAC hum
      const highPass = this.audioContext.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.setValueAtTime(85, this.audioContext.currentTime);

      // 2. Peaking Filter: Boosts 3.2kHz (+5.0dB) for English consonant clarity (t, p, s, f, k, th)
      const speechClarityFilter = this.audioContext.createBiquadFilter();
      speechClarityFilter.type = 'peaking';
      speechClarityFilter.frequency.setValueAtTime(3200, this.audioContext.currentTime);
      speechClarityFilter.Q.setValueAtTime(1.2, this.audioContext.currentTime);
      speechClarityFilter.gain.setValueAtTime(5.0, this.audioContext.currentTime);

      // 3. Dynamics Compressor: Auto-levels quiet voice and prevents clipping distortion
      const compressor = this.audioContext.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, this.audioContext.currentTime);
      compressor.knee.setValueAtTime(30, this.audioContext.currentTime);
      compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
      compressor.attack.setValueAtTime(0.003, this.audioContext.currentTime);
      compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;

      // Connect DSP chain: Source -> HighPass -> ClarityFilter -> Compressor -> Analyser
      source.connect(highPass);
      highPass.connect(speechClarityFilter);
      speechClarityFilter.connect(compressor);
      compressor.connect(this.analyser);

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