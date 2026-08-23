import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Maximize2, 
  Sparkles,
  Volume2
} from 'lucide-react';

export default function DrawingViewerModal({ isOpen, onClose, latestMessage }) {
  const [selectedDwg, setSelectedDwg] = useState('dwg-01');
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!isOpen) return null;

  const drawings = [
    {
      id: 'dwg-01',
      code: 'AR-CW-102 (Rev P03)',
      title: 'Canary Wharf South Elevation & Curtain Walling Section',
      scale: '1:50 @ A1',
      stage: 'RIBA Stage 3',
      type: 'Façade Detail',
      elements: [
        { name: 'Triple Low-E Glazing Unit (U=1.35 W/m²K)', x: '25%', y: '35%' },
        { name: 'Insulated Spandrel Back Pan (Part L Compliance)', x: '45%', y: '65%' },
        { name: 'Cavity Barrier (Class A1 Non-Combustible)', x: '70%', y: '50%' }
      ]
    },
    {
      id: 'dwg-02',
      code: 'AR-CW-205 (Rev P02)',
      title: 'Level 12 Terrace Brise-Soleil & Louver Detail',
      scale: '1:20 @ A1',
      stage: 'RIBA Stage 3',
      type: 'Solar Shading',
      elements: [
        { name: '600mm Louver Overhang (LPA Sightline Approved)', x: '30%', y: '40%' },
        { name: '15-Degree Tilt Fin Angle (88% Shading)', x: '65%', y: '60%' }
      ]
    },
    {
      id: 'dwg-03',
      code: 'BIM-COORD-04',
      title: 'Structural Transfer Beam vs M&E Services Clash Map',
      scale: 'NTS (BIM 3D)',
      stage: 'RIBA Stage 3',
      type: 'BIM Clash Detection',
      elements: [
        { name: 'Transfer Girder #TG-04 Clash (Resolved)', x: '40%', y: '45%' },
        { name: 'Primary Supply Air Duct 800x400', x: '55%', y: '70%' }
      ]
    }
  ];

  const current = drawings.find(d => d.id === selectedDwg) || drawings[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>실시간 도면 검토 & HUD 자막 뷰어 (Architectural Drawing HUD)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  {current.code}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {current.title} | {current.scale} | {current.stage}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button 
                onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="축소"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-bold text-slate-300 px-2">{zoomLevel}%</span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(200, prev + 15))}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="확대"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(100)}
                className="p-1 text-slate-400 hover:text-white rounded ml-1"
                title="원래 배율"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawing Selector Ribbon */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center space-x-2 overflow-x-auto">
          {drawings.map((dwg) => (
            <button
              key={dwg.id}
              onClick={() => setSelectedDwg(dwg.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 ${
                selectedDwg === dwg.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>{dwg.code}</span>
            </button>
          ))}
        </div>

        {/* Drawing Canvas Area with Interactive CAD Blueprint Aesthetic */}
        <div className="flex-1 bg-slate-950 relative overflow-auto flex items-center justify-center p-8">
          
          {/* Blueprint Grid Pattern */}
          <div 
            className="w-[900px] h-[550px] bg-[#0c192c] border-2 border-sky-900/60 rounded-xl relative shadow-2xl transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              backgroundImage: 'radial-gradient(#1e3a5f 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          >
            {/* Title Block on Blueprint */}
            <div className="absolute bottom-4 right-4 bg-[#081220]/90 border border-sky-500/50 p-3 rounded-lg text-[10px] text-sky-200 space-y-1 w-64">
              <div className="font-bold text-sky-400 border-b border-sky-500/30 pb-1 flex justify-between">
                <span>{current.code}</span>
                <span>{current.stage}</span>
              </div>
              <div className="text-slate-300 font-semibold">{current.title}</div>
              <div className="flex justify-between text-slate-400">
                <span>SCALE: {current.scale}</span>
                <span>PROJECT: E14 LONDON</span>
              </div>
            </div>

            {/* Architectural Vector Schematic Mock */}
            <div className="absolute inset-8 border border-sky-500/30 rounded p-6 flex flex-col justify-between">
              
              {/* Structural Frame Lines */}
              <div className="w-full flex justify-between items-center h-full">
                <div className="w-16 h-full border-r-2 border-dashed border-sky-500/40 flex flex-col justify-around text-[9px] text-sky-400/80">
                  <span>LEVEL 14 (+56.00m)</span>
                  <span>LEVEL 13 (+52.00m)</span>
                  <span>LEVEL 12 (+48.00m)</span>
                  <span>LEVEL 11 (+44.00m)</span>
                </div>

                <div className="flex-1 h-full px-8 relative flex items-center justify-center">
                  {/* Façade Profile Vector Box */}
                  <div className="w-4/5 h-4/5 border-2 border-sky-400/60 bg-sky-500/5 rounded-lg flex flex-col justify-between p-4 relative">
                    <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>{current.type} Blueprint Vector</span>
                    </div>

                    {/* Interactive Annotation Hotspots */}
                    {current.elements.map((elem, i) => (
                      <div 
                        key={i}
                        className="absolute bg-slate-900/90 border border-amber-400/80 text-amber-300 px-2.5 py-1 rounded text-[10px] font-bold shadow-lg flex items-center gap-1.5 animate-pulse"
                        style={{ top: elem.y, left: elem.x }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{elem.name}</span>
                      </div>
                    ))}

                    <div className="text-center text-[11px] text-sky-400/60 font-mono">
                      --- [CAD REVISION VERIFIED FOR PLANNING SUBMISSION] ---
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Floating Subtitle HUD Overlay (Bottom of Screen) */}
          {latestMessage && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-auto">
              <div className="bg-slate-900/95 border-2 border-amber-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-1.5 text-white">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>실시간 도면 연동 자막 HUD: {latestMessage.speaker}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">{latestMessage.timestamp}</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  "{latestMessage.original}"
                </div>
                <div className="text-xs font-bold text-amber-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                  ⚡ 통역: {latestMessage.translation}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}