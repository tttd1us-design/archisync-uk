import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Clock, 
  HelpCircle, 
  Volume2, 
  Filter, 
  Edit3,
  Check,
  Tag
} from 'lucide-react';
import { INDUSTRY_DICTIONARIES } from '../data/industryDictionaries';

export default function TranscriptView({ 
  transcript = [], 
  speakers = [], 
  industryId = 'it', 
  customDict = [] 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeakerFilter, setSelectedSpeakerFilter] = useState('ALL');
  const [hoveredTerm, setHoveredTerm] = useState(null);

  const dict = INDUSTRY_DICTIONARIES[industryId] || INDUSTRY_DICTIONARIES.it;
  const allTerms = [...dict.terms, ...customDict];

  // Highlight jargon in text
  const renderHighlightedText = (text) => {
    let parts = [text];

    allTerms.forEach(item => {
      const termKeyword = item.term.split(' ')[0].replace(/[\(\)]/g, '');
      const keywordsToMatch = [termKeyword, ...(item.phonetics || [])].filter(Boolean);

      keywordsToMatch.forEach(kw => {
        const nextParts = [];
        parts.forEach(part => {
          if (typeof part === 'string') {
            const regex = new RegExp(`(${kw})`, 'gi');
            const split = part.split(regex);
            split.forEach((sub, i) => {
              if (sub.toLowerCase() === kw.toLowerCase()) {
                nextParts.push(
                  <span
                    key={`${kw}-${i}-${Math.random()}`}
                    onMouseEnter={() => setHoveredTerm(item)}
                    onMouseLeave={() => setHoveredTerm(null)}
                    className="relative inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/40 transition-colors"
                  >
                    {sub}
                    <Tag className="w-2.5 h-2.5 ml-1 opacity-70" />
                  </span>
                );
              } else if (sub) {
                nextParts.push(sub);
              }
            });
          } else {
            nextParts.push(part);
          }
        });
        parts = nextParts;
      });
    });

    return parts;
  };

  const filteredTranscript = transcript.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.speakerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpeaker = selectedSpeakerFilter === 'ALL' || item.speakerId === selectedSpeakerFilter;
    return matchesSearch && matchesSpeaker;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Header with Search and Speaker Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">화자별 회의 음성 전사 대화록</h3>
            <p className="text-[11px] text-slate-400">보라색 단어에 마우스를 올리면 업계 사전 정의가 표시됩니다.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Speaker Filter Dropdown */}
          <select
            value={selectedSpeakerFilter}
            onChange={(e) => setSelectedSpeakerFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">전체 화자 ({speakers.length}명)</option>
            {speakers.map(spk => (
              <option key={spk.id} value={spk.id}>{spk.name}</option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="대화 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 w-40 sm:w-48 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Dictionary Tooltip Floater */}
      {hoveredTerm && (
        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/50 shadow-lg text-xs animate-fadeIn">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-indigo-300">{hoveredTerm.term}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
              {hoveredTerm.category || '용어'}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">{hoveredTerm.definition}</p>
        </div>
      )}

      {/* Transcript Dialog Stream */}
      <div className="space-y-3.5 overflow-y-auto max-h-[580px] pr-1.5">
        {filteredTranscript.map((t, idx) => {
          const speaker = speakers.find(s => s.id === t.speakerId) || {
            name: t.speakerName,
            color: 'bg-indigo-600',
            role: '참석자'
          };

          return (
            <div
              key={t.id || idx}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${speaker.color} text-white flex items-center justify-center text-[10px] font-bold shadow-sm`}>
                    {speaker.name[0]}
                  </div>
                  <span className="text-xs font-bold text-slate-200">{t.speakerName}</span>
                  {speaker.role && (
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {speaker.role}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <Clock className="w-3 h-3" />
                  {t.time}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-8">
                {renderHighlightedText(t.text)}
              </p>
            </div>
          );
        })}

        {filteredTranscript.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            검색 결과와 일치하는 대화 내용이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
