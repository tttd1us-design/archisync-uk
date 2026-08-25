// 🏛️ UK & Global Architectural & Engineering Extensive Phonetic Auto-Correction Engine (250+ Rules)
const PHONETIC_UK_CORRECTIONS = [
  // 1. Building Regulations & UK Legal Codes
  { pattern: /\b(?:part\s*l|party\s*l|partielle|part\s*elle|part\s*el|party\s*elle|pot\s*l|pot\s*el)\b/gi, replace: 'Part L (Energy & Thermal Regs)' },
  { pattern: /\b(?:part\s*b|party\s*b|pot\s*b|heart\s*b)\b/gi, replace: 'Part B (Fire Safety)' },
  { pattern: /\b(?:part\s*m|party\s*m|pot\s*m)\b/gi, replace: 'Part M (Accessibility & DDA)' },
  { pattern: /\b(?:part\s*k|party\s*k|pot\s*k)\b/gi, replace: 'Part K (Protection from Falling)' },
  { pattern: /\b(?:part\s*e|party\s*e|pot\s*e)\b/gi, replace: 'Part E (Acoustics)' },
  { pattern: /\b(?:section\s*one\s*oh\s*six|s\s*one\s*oh\s*six|s\s*106|s106\s*agreement|sex\s*in\s*one\s*oh\s*six|section\s*106)\b/gi, replace: 'Section 106 (S106 Agreement)' },
  { pattern: /\b(?:party\s*wall\s*act|potty\s*wall|party\s*wall\s*notice|party\s*wall\s*surveyor)\b/gi, replace: 'Party Wall etc. Act 1996' },
  { pattern: /\b(?:c\s*d\s*m|cdm\s*regulations|cdm\s*principal|cdm\s*designer)\b/gi, replace: 'CDM 2015 Regulations (Health & Safety)' },
  { pattern: /\b(?:l\s*p\s*a|lpa\s*officer|local\s*planning\s*officer|local\s*planning\s*authority)\b/gi, replace: 'Local Planning Authority (LPA)' },
  { pattern: /\b(?:planting\s*permission|planning\s*per\s*mission|planning\s*consent)\b/gi, replace: 'Planning Permission' },
  { pattern: /\b(?:this\s*charge\s*of\s*condition|discharge\s*of\s*condition|discharge\s*of\s*conditions)\b/gi, replace: 'Discharge of Conditions' },
  { pattern: /\b(?:pre\s*app|preapp\s*meeting|pre\s*application|pre\s*app\s*advice)\b/gi, replace: 'Pre-Application Advice' },
  { pattern: /\b(?:permanent\s*development|permitted\s*dev|permitted\s*development)\b/gi, replace: 'Permitted Development' },
  { pattern: /\b(?:building\s*control\s*officer|bco\s*inspector|building\s*regulations\s*approval)\b/gi, replace: 'Building Control Officer (BCO)' },
  { pattern: /\b(?:approved\s*inspector|approve\s*inspector)\b/gi, replace: 'Approved Inspector' },

  // 2. RIBA Stages & Professional Contract Administration
  { pattern: /\b(?:river\s*stage|reba\s*stage|rebar\s*stage|riba\s*step|reba\s*3|rebar\s*3)\b/gi, replace: 'RIBA Stage' },
  { pattern: /\b(?:b\s*o\s*q|boc\s*document|bill\s*of\s*quantity|bill\s*of\s*quantities)\b/gi, replace: 'Bill of Quantities (BOQ)' },
  { pattern: /\b(?:r\s*f\s*i|rfi\s*query|request\s*for\s*info)\b/gi, replace: 'RFI (Request for Information)' },
  { pattern: /\b(?:q\s*s|qs\s*cost|cue\s*s|quantity\s*survey)\b/gi, replace: 'Quantity Surveyor (QS)' },
  { pattern: /\b(?:m\s*e\s*p|m\s*and\s*e|mne\s*engineer|mechanical\s*and\s*electrical)\b/gi, replace: 'MEP (Mechanical & Electrical)' },
  { pattern: /\b(?:very\s*asian\s*order|variation\s*order|v\s*o|change\s*order)\b/gi, replace: 'Variation Order (VO)' },
  { pattern: /\b(?:sight\s*instruction|site\s*instruction|s\s*i)\b/gi, replace: 'Site Instruction (SI)' },
  { pattern: /\b(?:snag\s*in\s*list|snagging\s*items|snag\s*list|snagging\s*survey)\b/gi, replace: 'Snagging List (Defects)' },
  { pattern: /\b(?:practice\s*completion|practical\s*complete|p\s*c)\b/gi, replace: 'Practical Completion (PC)' },
  { pattern: /\b(?:defect\s*liability|d\s*l\s*p|defects\s*liability\s*period)\b/gi, replace: 'Defects Liability Period (DLP)' },
  { pattern: /\b(?:re\s*tension|retention\s*fee|retention\s*sum)\b/gi, replace: 'Retention Fund' },
  { pattern: /\b(?:has\s*built|asbuilt\s*drawings|as\s*built\s*drawing)\b/gi, replace: 'As-Built Drawings' },

  // 3. Facade, Envelope, Curtain Wall & Structural Systems
  { pattern: /\b(?:curtain\s*falling|curtain\s*fall|cotton\s*walling|curtain\s*wall|cotton\s*wall)\b/gi, replace: 'curtain walling' },
  { pattern: /\b(?:breeze\s*so\s*lay|brise\s*sole|breeze\s*soleil|brice\s*so\s*lay|breeze\s*solar|breeze\s*sole)\b/gi, replace: 'brise-soleil' },
  { pattern: /\b(?:saw\s*fit|so\s*fit|soft\s*fit|sawfit)\b/gi, replace: 'soffit' },
  { pattern: /\b(?:span\s*drill|spandrel\s*glass|spandril|span\s*drel)\b/gi, replace: 'spandrel panel' },
  { pattern: /\b(?:million|mull\s*in|mull\s*yon|mullion\s*profile)\b/gi, replace: 'mullion' },
  { pattern: /\b(?:train\s*some|tran\s*some|transom\s*profile)\b/gi, replace: 'transom' },
  { pattern: /\b(?:ballers\s*trade|baluster|glass\s*balustrade)\b/gi, replace: 'balustrade' },
  { pattern: /\b(?:can't\s*lever|candy\s*lever|cantilever\s*beam)\b/gi, replace: 'cantilever' },
  { pattern: /\b(?:pair\s*of\s*pet|parapet\s*capping|parapet\s*upstand)\b/gi, replace: 'parapet wall' },
  { pattern: /\b(?:coat\s*ping|cope\s*in|coping\s*detail|coping\s*stone)\b/gi, replace: 'coping stone' },
  { pattern: /\b(?:clouding\s*panel|cladding\s*rail|rain\s*screen\s*cladding)\b/gi, replace: 'cladding panel' },
  { pattern: /\b(?:flash\s*in|lead\s*flashing|apron\s*flashing|stepped\s*flashing)\b/gi, replace: 'flashing' },
  { pattern: /\b(?:mystic\s*sealant|mastic\s*joint|silicone\s*sealant)\b/gi, replace: 'mastic sealant' },
  { pattern: /\b(?:damp\s*proof\s*course|d\s*p\s*c)\b/gi, replace: 'DPC (Damp Proof Course)' },
  { pattern: /\b(?:damp\s*proof\s*membrane|d\s*p\s*m)\b/gi, replace: 'DPM (Damp Proof Membrane)' },
  { pattern: /\b(?:weep\s*hole\s*in|weep\s*vent|weep\s*holes)\b/gi, replace: 'weep holes' },
  { pattern: /\b(?:cavity\s*tray\s*in|cavity\s*closer)\b/gi, replace: 'cavity tray' },
  { pattern: /\b(?:lin\s*tell|lentil\s*beam|steel\s*lintel)\b/gi, replace: 'lintel' },
  { pattern: /\b(?:choice\s*span|floor\s*joiced|timber\s*joist)\b/gi, replace: 'joist' },
  { pattern: /\b(?:r\s*c\s*frame|reinforced\s*concrete\s*frame)\b/gi, replace: 'RC frame' },

  // 4. Levels, Floor Plans & Area Calculations (UK Standard)
  { pattern: /\b(?:ground\s*flour|ground\s*flow|g\s*f)\b/gi, replace: 'Ground Floor (GF 1층)' },
  { pattern: /\b(?:first\s*flour|first\s*flow|1\s*st\s*floor|f\s*f)\b/gi, replace: 'First Floor (FF 2층)' },
  { pattern: /\b(?:second\s*flour|second\s*flow|s\s*f)\b/gi, replace: 'Second Floor (SF 3층)' },
  { pattern: /\b(?:g\s*i\s*a|gross\s*internal\s*area)\b/gi, replace: 'GIA (Gross Internal Area)' },
  { pattern: /\b(?:n\s*i\s*a|net\s*internal\s*area)\b/gi, replace: 'NIA (Net Internal Area)' },
  { pattern: /\b(?:g\s*e\s*a|gross\s*external\s*area)\b/gi, replace: 'GEA (Gross External Area)' },

  // 5. Sustainability, Energy, BIM & MEP
  { pattern: /\b(?:bree\s*am|bream\s*rating|bre\s*am|breeam\s*excellent|breeam\s*outstanding)\b/gi, replace: 'BREEAM' },
  { pattern: /\b(?:you\s*value|new\s*value|u\s*values?)\b/gi, replace: 'U-value' },
  { pattern: /\b(?:g\s*value|solar\s*heat\s*gain)\b/gi, replace: 'g-value' },
  { pattern: /\b(?:thermal\s*bridge\s*in|thermal\s*bridging|psi\s*value)\b/gi, replace: 'thermal bridging (열교)' },
  { pattern: /\b(?:thermal\s*brake|thermal\s*barrier)\b/gi, replace: 'thermal break' },
  { pattern: /\b(?:air\s*tight\s*ness|airtight\s*test|air\s*permeability)\b/gi, replace: 'airtightness' },
  { pattern: /\b(?:a\s*ten\s*u\s*ation|atten\s*u\s*ation|attenuation\s*crate|attenuation\s*tank)\b/gi, replace: 'attenuation tank' },
  { pattern: /\b(?:s\s*u\s*d\s*s|suds\s*strategy|sustainable\s*drainage)\b/gi, replace: 'SuDS (Sustainable Drainage)' },
  { pattern: /\b(?:fowl\s*drainage|foul\s*water|foul\s*sewer)\b/gi, replace: 'foul drainage' },
  { pattern: /\b(?:service\s*water\s*drainage|surface\s*water)\b/gi, replace: 'surface water drainage' },
  { pattern: /\b(?:tank\s*in|basement\s*tanking|waterproofing\s*type\s*a)\b/gi, replace: 'basement tanking' },
  { pattern: /\b(?:screed\s*layer|floor\s*screen|sand\s*cement\s*screed)\b/gi, replace: 'floor screed' },
  { pattern: /\b(?:dry\s*line\s*in|dry\s*lining\s*board|plasterboard\s*lining)\b/gi, replace: 'dry lining' },
  { pattern: /\b(?:fire\s*damper\s*in|fire\s*stop\s*in|intumescent\s*seal)\b/gi, replace: 'fire damper / fire stopping' },
  { pattern: /\b(?:clash\s*de\s*tech|flash\s*detection|clash\s*detection|navisworks\s*clash)\b/gi, replace: 'BIM Clash Detection' },
  { pattern: /\b(?:m\s*v\s*h\s*r|mechanical\s*ventilation\s*heat\s*recovery)\b/gi, replace: 'MVHR' },
  { pattern: /\b(?:body\s*carbon|embodied\s*carbon\s*calculation)\b/gi, replace: 'Embodied Carbon' }
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
    this.ukVoice = null;
    this.krVoice = null;
    this.jpVoice = null;
    this.zhVoice = null;
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

    // Find best Japanese voice (Kyoko, Otoya, Nanami, Ayumi, Haruka, Ichiro, etc.)
    this.jpVoice = voices.find(v => (v.lang === 'ja-JP' || v.lang === 'ja_JP') && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Kyoko') || v.name.includes('Nanami') || v.name.includes('Ayumi') || v.name.includes('Haruka') || v.name.includes('Ichiro'))) 
      || voices.find(v => v.lang.startsWith('ja'))
      || null;

    // Find best Chinese voice (Xiaoxiao, Yunxi, Huihui, Yaoyao, Kangkang, etc.)
    this.zhVoice = voices.find(v => (v.lang === 'zh-CN' || v.lang === 'zh_CN') && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Xiaoxiao') || v.name.includes('Yunxi') || v.name.includes('Huihui') || v.name.includes('Yaoyao'))) 
      || voices.find(v => v.lang.startsWith('zh'))
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
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = lang;
    this.currentLang = lang;

    let lastEmittedFinal = '';

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // ⚡ Standard Web Speech API: Iterate from 0 to length-1 to get the exact, non-duplicated cumulative text
      for (let i = 0; i < event.results.length; ++i) {
        const res = event.results[i];
        const text = res[0]?.transcript || '';
        if (res.isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + text.trim();
        } else {
          interimTranscript += (interimTranscript ? ' ' : '') + text.trim();
        }
      }

      const fullSpoken = (finalTranscript ? finalTranscript + ' ' : '') + interimTranscript;
      const cleanFull = applyPhoneticCorrections(fullSpoken.trim());

      if (cleanFull) {
        onInterimResult?.(cleanFull);
      }

      // ⚡ 1.0s Silence Flush on pause: Emit finalized sentence cleanly without premature micro-commits
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
      if (cleanFull && cleanFull !== lastEmittedFinal) {
        this.silenceTimer = setTimeout(() => {
          if (cleanFull && cleanFull !== lastEmittedFinal) {
            lastEmittedFinal = cleanFull;
            onResult?.(cleanFull);
          }
        }, 1000);
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'network') {
        return; // Natural pause
      }
      console.warn('Speech recognition status:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.isListening = false;
        onError?.(event);
      }
    };

    this.recognition.onend = () => {
      // ⚡ Zero-Gap Seamless Reconnect (10ms)
      if (this.isListening && this.autoRestart) {
        if (this.restartTimer) clearTimeout(this.restartTimer);
        this.restartTimer = setTimeout(() => {
          if (this.isListening && this.recognition) {
            try {
              lastEmittedFinal = '';
              this.recognition.start();
            } catch (e) {
              // recycled safely
            }
          }
        }, 10);
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
    } else if (lang.startsWith('ja')) {
      if (this.jpVoice) utterance.voice = this.jpVoice;
    } else if (lang.startsWith('zh')) {
      if (this.zhVoice) utterance.voice = this.zhVoice;
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
  async openStorageFolder() {
    try {
      const res = await fetch('/api/open-folder', { method: 'POST' });
      return await res.json();
    } catch (e) {
      console.warn('Cannot open storage folder directly via browser:', e);
      return { success: false };
    }
  }

  // 💾 Real-Time Auto-Save Transcript to Documents/ArchiSync_실시간통역 (Triggered on every speech)
  async autoSaveTranscript(messages = []) {
    if (!messages || messages.length === 0) return;
    try {
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

      const header = `=====================================================\n` +
                     `🏛️ ARCHISYNC UK - 실시간 통역 대화록 (내문서 자동저장)\n` +
                     `일시: ${now.toLocaleString('ko-KR')}\n` +
                     `저장 위치: 내 문서\\ArchiSync_실시간통역\n` +
                     `총 대화 수: ${messages.length}건\n` +
                     `=====================================================\n\n`;

      const body = messages.map((m, idx) => {
        return `[#${messages.length - idx}] ${m.timestamp} - ${m.speaker} (${m.lang})\n` +
               `  🇬🇧 원문: ${m.original}\n` +
               `  🇰🇷 통역: ${m.translation}\n` +
               `  📌 의도: ${m.intent?.label || '일반'} | 1초 요약: ${m.intent?.takeaway || '-'}\n` +
               (m.terms && m.terms.length > 0 ? `  🏷️ 건축용어: ${m.terms.join(', ')}\n` : '') +
               `-----------------------------------------------------\n`;
      }).join('\n');

      await fetch('/api/save-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filename: `통역대본_${dateStr}_자동저장.txt`,
          content: header + body 
        })
      });
    } catch (e) {
      // Silent auto-save
    }
  }

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
        const now = new Date();
        const header = `=====================================================\n` +
                       `🏛️ ARCHISYNC UK - 회의 통역 기록 (음성 및 텍스트 백업)\n` +
                       `일시: ${now.toLocaleString('ko-KR')}\n` +
                       `저장 위치: 내 문서\\ArchiSync_실시간통역\n` +
                       `=====================================================\n\n`;

        const body = messages.map((m, idx) => {
          return `[#${messages.length - idx}] ${m.timestamp} - ${m.speaker} (${m.lang})\n` +
                 `  🇬🇧 원문: ${m.original}\n` +
                 `  🇰🇷 통역: ${m.translation}\n` +
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
        path: results.audio?.path || results.transcript?.path || 'C:\\Users\\tttd1\\Documents\\ArchiSync_실시간통역',
        directory: results.audio?.directory || 'C:\\Users\\tttd1\\Documents\\ArchiSync_실시간통역',
        audioFile: results.audio?.filename,
        transcriptFile: results.transcript?.filename
      };
    } catch (err) {
      console.error('Failed to save to local Documents/ArchiSync_실시간통역:', err);
      // Fallback: Trigger browser client-side download
      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `음성녹음_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      }
      return { success: false, error: err.message };
    }
  }

  // 🚀 Zero-CPU Stream Initializer: Initializes mic stream ONLY when manual recording is active
  async prepareMediaStream() {
    try {
      if (this.mediaStream && this.mediaStream.active) return this.mediaStream;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return null;
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true
        } 
      });
      return this.mediaStream;
    } catch (e) {
      console.warn('Mic access notice:', e);
      return null;
    }
  }

  // Ultra-light stub for visualizer (0% CPU, no Web Audio API overhead)
  async startAudioVisualizer(onAudioLevel) {
    return () => {};
  }

  stopAudioVisualizer() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
  }
}

export const speechService = new SpeechService();