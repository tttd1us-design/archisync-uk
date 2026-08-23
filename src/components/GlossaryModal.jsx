import React, { useState } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Tag, 
  Plus, 
  Check, 
  ExternalLink,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { ARCHITECTURE_GLOSSARY } from '../data/architectureGlossary';

export default function GlossaryModal({ isOpen, onClose, initialSearchTerm = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customList, setCustomList] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // New term form
  const [newTerm, setNewTerm] = useState('');
  const [newCategory, setNewCategory] = useState('Façade & Envelope');
  const [newUkMeaning, setNewUkMeaning] = useState('');
  const [newKrMeaning, setNewKrMeaning] = useState('');

  if (!isOpen) return null;

  const allTerms = [...customList, ...ARCHITECTURE_GLOSSARY];

  const categories = [
    'All',
    'RIBA & Process',
    'UK Regulations',
    'Façade & Envelope',
    'Structural',
    'MEP & Services',
    'Sustainability',
    'Procurement & Cost'
  ];

  const filteredTerms = allTerms.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery = !searchTerm || 
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.krMeaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ukMeaning.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleAddNewTerm = (e) => {
    e.preventDefault();
    if (!newTerm || !newKrMeaning) return;

    const entry = {
      term: newTerm,
      category: newCategory,
      ukMeaning: newUkMeaning || newTerm,
      krMeaning: newKrMeaning,
      example: 'Custom user-defined architectural term for project coordination.'
    };

    setCustomList(prev => [entry, ...prev]);
    setIsAddingNew(false);
    setNewTerm('');
    setNewUkMeaning('');
    setNewKrMeaning('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>영국 건축설계 전문 용어 사전 (UK Architectural Glossary)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  3,000+ DB
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                RIBA 표준, 영국 건축법규 (Part L/B/M), 파사드, BIM, MEP 전문 용어 및 한국어 해설
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/50">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="건축 용어 검색 (e.g. Part L, Curtain Wall, BREEAM, GIA...)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 용어 등록</span>
            </button>
          </div>

          {/* Categories Pill Scroll */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Add New Custom Term Form */}
        {isAddingNew && (
          <form onSubmit={handleAddNewTerm} className="p-4 bg-slate-800/90 border-b border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">용어명 (UK English Term):</label>
              <input
                type="text"
                required
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                placeholder="e.g. Acoustic Baffle"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">카테고리:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">영문 설명 (UK Context):</label>
              <input
                type="text"
                value={newUkMeaning}
                onChange={(e) => setNewUkMeaning(e.target.value)}
                placeholder="Sound absorbing panel suspended from ceiling..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">한국어 해설:</label>
              <input
                type="text"
                required
                value={newKrMeaning}
                onChange={(e) => setNewKrMeaning(e.target.value)}
                placeholder="천장 흡음 배플 패널"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                저장하기
              </button>
            </div>
          </form>
        )}

        {/* Terms List Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              검색 조건에 맞는 건축 용어가 없습니다.
            </div>
          ) : (
            filteredTerms.map((item, idx) => (
              <div 
                key={idx}
                className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 hover:border-amber-500/40 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-amber-300">{item.term}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">🇬🇧 UK Context & Definition:</span>
                    <p className="text-slate-200">{item.ukMeaning}</p>
                  </div>
                  <div className="bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-900/40">
                    <span className="text-[10px] font-bold text-indigo-300 block mb-1">🇰🇷 한국어 실무 해설:</span>
                    <p className="text-slate-200">{item.krMeaning}</p>
                  </div>
                </div>

                {item.example && (
                  <div className="text-[11px] text-slate-400 italic bg-slate-900/30 px-3 py-1.5 rounded-lg">
                    💡 회의 실무 예문: "{item.example}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}