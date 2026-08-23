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
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = lang;
    this.currentLang = lang;

    let lastFinalText = '';

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Stream interim text smoothly
      if (interimTranscript) {
        onInterimResult?.(interimTranscript.trim());
      }
      if (finalTranscript && finalTranscript.trim() !== lastFinalText) {
        lastFinalText = finalTranscript.trim();
        onResult?.(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'network') {
        // Normal silence or brief network drop - keep session alive smoothly
        return;
      }
      console.warn('Speech recognition status:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.isListening = false;
        onError?.(event);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening && this.autoRestart) {
        // Safe 150ms debounce before restart to prevent browser lock & UI flicker
        if (this.restartTimer) clearTimeout(this.restartTimer);
        this.restartTimer = setTimeout(() => {
          if (this.isListening && this.recognition) {
            try {
              this.recognition.start();
            } catch (e) {
              // Ignore if already active
            }
          }
        }, 150);
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

  // Real-time audio waveform visualizer
  async startAudioVisualizer(onAudioLevel) {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return null;
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
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