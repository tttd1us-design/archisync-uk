import React from 'react';
import { X, Smartphone, Tablet, Share, PlusSquare, CheckCircle, Wifi, QrCode } from 'lucide-react';

export default function IosInstallModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                아이폰 & 아이패드 앱(PWA) 설치 가이드
              </h3>
              <p className="text-xs text-slate-400">Safari 브라우저를 통해 홈 화면에 1초 만에 설치</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions Steps */}
        <div className="space-y-4">
          
          <div className="flex items-start space-x-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div className="text-xs text-slate-200 space-y-1">
              <p className="font-bold text-amber-300">아이폰/아이패드 Safari 브라우저에서 접속</p>
              <p className="text-slate-400">
                아이폰 Safari 주소창에 아래 주소를 입력하거나 북마크하세요:
              </p>
              <div className="font-mono font-bold bg-slate-900 px-2.5 py-1.5 rounded text-sky-300 border border-slate-700 select-all text-xs flex items-center justify-between">
                <span>{typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:${window.location.port || '5173'}` : 'http://localhost:5173'}</span>
                <span className="text-[10px] text-amber-400 font-sans font-bold">터치하여 접속</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div className="text-xs text-slate-200 space-y-1">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <Share className="w-4 h-4 text-sky-400" /> Safari 하단/상단 [공유] 버튼 터치
              </p>
              <p className="text-slate-400">
                브라우저 툴바의 네모에서 위로 뻗은 화살표(공유) 아이콘을 누릅니다.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div className="text-xs text-slate-200 space-y-1">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <PlusSquare className="w-4 h-4 text-emerald-400" /> [홈 화면에 추가] 선택
              </p>
              <p className="text-slate-400">
                메뉴 목록을 살짝 아래로 내려 <strong>'홈 화면에 추가(Add to Home Screen)'</strong>를 누른 후 오른쪽 상단 [추가]를 터치합니다.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs text-emerald-300">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              홈 화면에 🏛️ <strong>ArchiSync UK</strong> 전용 앱 아이콘이 생성되며, 앱스토어 앱처럼 주소창 없는 전체 화면으로 작동합니다!
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg"
          >
            확인 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
}
