import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Upload, 
  Play, 
  Square, 
  Sparkles, 
  FileAudio, 
  Volume2,
  CheckCircle,
  Clock,
  Radio,
  FileText
} from 'lucide-react';
import { SAMPLE_MEETINGS } from '../data/sampleMeetings';
import { drawWaveform } from '../utils/audioVisualizer';

export default function AudioRecorder({ 
  selectedIndustry, 
  onStartAnalysis, 
  isAnalyzing, 
  onLoadSample 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [liveTranscriptLog, setLiveTranscriptLog] = useState([]);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const animationRef = useRef(null);

  // Canvas visualizer animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let frame = 0;
    const render = () => {
      frame++;
      const simulatedData = [
        Math.sin(frame * 0.1) * 0.5 + 0.5,
        Math.sin(frame * 0.15 + 1) * 0.6 + 0.4,
        Math.cos(frame * 0.08) * 0.7 + 0.3,
        Math.sin(frame * 0.2) * 0.8 + 0.2,
      ];
      drawWaveform(canvas, simulatedData, isRecording && !isPaused);
      animationRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording, isPaused]);

  // Recording Timer & Live speech bubble simulator
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          const next = prev + 1;
          if (next === 3) {
            setLiveTranscriptLog(l => [...l, { speaker: '화자 1 (진행자)', time: '00:03', text: '지금부터 이번 회의를 시작하겠습니다. 업계 특화 음성 인식 엔진이 작동 중입니다...' }]);
          } else if (next === 7) {
            setLiveTranscriptLog(l => [...l, { speaker: '화자 2 (담당자)', time: '00:07', text: '네, 실시간으로 전문 용어와 약어가 사전 보정되어 텍스트로 변환되고 있습니다.' }]);
          } else if (next === 12) {
            setLiveTranscriptLog(l => [...l, { speaker: '화자 1 (진행자)', time: '00:12', text: '좋습니다. 오늘 회의 핵심 액션아이템은 마감일과 함께 자동 추출될 예정입니다.' }]);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingSeconds(0);
    setLiveTranscriptLog([]);
    setUploadedFile(null);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingSeconds(0);
    setLiveTranscriptLog([]);
  };

  const completeRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    // Auto complete recording and prepare payload
    const customMeeting = {
      id: `meeting-${Date.now()}`,
      industryId: selectedIndustry,
      title: `[실시간 녹음 회의] ${new Date().toLocaleDateString('ko-KR')} 회의`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      duration: `${Math.floor(recordingSeconds / 60)}분 ${recordingSeconds % 60}초`,
      speakers: [
        { id: 'spk-live-1', name: '화자 1 (진행자)', role: '진행', color: 'bg-indigo-600' },
        { id: 'spk-live-2', name: '화자 2 (담당자)', role: '담당자', color: 'bg-emerald-600' }
      ],
      transcript: liveTranscriptLog.length > 0 ? liveTranscriptLog.map((l, i) => ({
        id: `t-live-${i}`,
        speakerId: i % 2 === 0 ? 'spk-live-1' : 'spk-live-2',
        speakerName: l.speaker,
        time: l.time,
        text: l.text
      })) : [
        { id: 't-1', speakerId: 'spk-live-1', speakerName: '화자 1 (진행자)', time: '00:05', text: '주요 안건에 대해 논의를 마치고 즉시 실행에 들어가겠습니다.' }
      ]
    };
    onStartAnalysis(customMeeting);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsRecording(false);

    // Matching demo scenario or custom payload based on selected industry
    const sample = SAMPLE_MEETINGS.find(m => m.industryId === selectedIndustry) || SAMPLE_MEETINGS[0];
    const meetingPayload = {
      ...sample,
      id: `upload-${Date.now()}`,
      title: `[업로드 음성 분석] ${file.name.replace(/\.[^/.]+$/, "")}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      audioName: file.name
    };
    onStartAnalysis(meetingPayload);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            2. 음성 입력 & AI 분석 모드 (실시간 녹음 / 파일 업로드 / 1초 데모)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            브라우저 마이크를 통한 실시간 전사 또는 음성 파일(.mp3, .wav)을 업로드하세요.
          </p>
        </div>

        {/* 1-Click Fast Demo Scenarios */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            빠른 실전 데모:
          </span>
          {SAMPLE_MEETINGS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onLoadSample(sample)}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700/80 transition-all"
            >
              {sample.industryId.toUpperCase()} 회의
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        {/* Left: Real-time Audio Mic Recorder */}
        <div className="lg:col-span-6 flex flex-col justify-between p-5 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
              <span className="text-xs font-semibold text-slate-300">
                {isRecording ? '실시간 회의 음성 스트리밍 전사 중...' : '마이크 대기 상태'}
              </span>
            </div>
            <span className="font-mono text-sm font-bold text-slate-200 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              {formatTime(recordingSeconds)}
            </span>
          </div>

          {/* Waveform Canvas */}
          <div className="h-16 w-full flex items-center justify-center bg-slate-900/60 rounded-lg p-2 mb-4 border border-slate-800/50">
            <canvas ref={canvasRef} width={400} height={60} className="w-full h-full" />
          </div>

          {/* Recording Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isAnalyzing}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
              >
                <Mic className="w-4 h-4" />
                마이크 실시간 녹음 켜기 (Start)
              </button>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className={`px-3.5 py-3 rounded-xl text-xs font-bold transition-all border ${
                    isPaused 
                      ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500' 
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  }`}
                  title={isPaused ? "녹음 재개" : "녹음 일시정지"}
                >
                  {isPaused ? '▶️ 재개' : '⏸️ 일시정지'}
                </button>
                <button
                  onClick={cancelRecording}
                  className="px-3.5 py-3 rounded-xl text-xs font-bold transition-all bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700"
                  title="녹음 끄기 (취소)"
                >
                  ❌ 끄기
                </button>
                <button
                  onClick={completeRecording}
                  disabled={isAnalyzing}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                >
                  <Square className="w-4 h-4 fill-current" />
                  녹음 완료 & AI 회의록 생성
                </button>
              </>
            )}
          </div>

          {/* Live speech preview during recording */}
          {isRecording && liveTranscriptLog.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-indigo-500/30 text-xs space-y-1.5 animate-fadeIn">
              {liveTranscriptLog.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-400 shrink-0">[{log.time}] {log.speaker}:</span>
                  <span className="text-slate-300">{log.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Audio / Video File Upload Dropzone */}
        <div className="lg:col-span-6 flex flex-col justify-between p-5 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileAudio className="w-4 h-4 text-purple-400" />
                녹음된 음성/영상 파일 업로드
              </span>
              <span className="text-[11px] text-slate-500">MP3, WAV, M4A, MP4 (최대 500MB)</span>
            </div>

            <label className="relative flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-700 hover:border-indigo-500/70 rounded-xl cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all group">
              <Upload className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 mb-1.5 transition-colors" />
              <p className="text-xs font-medium text-slate-300 group-hover:text-indigo-300">
                {uploadedFile ? uploadedFile.name : '클릭하여 오디오 파일 선택 또는 드래그 앤 드롭'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">화자 분리(Diarization) 및 도메인 전처리 자동 적용</p>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isAnalyzing}
              />
            </label>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              노이즈 캔슬링 & 고품질 전사 지원
            </span>
            <span className="text-indigo-400 font-medium">Whisper + Gemini Pro 엔진 연동</span>
          </div>
        </div>
      </div>
    </div>
  );
}
