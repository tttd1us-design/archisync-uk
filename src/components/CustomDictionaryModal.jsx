import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  X, 
  Save, 
  Upload, 
  Download, 
  Check,
  Tag
} from 'lucide-react';

export default function CustomDictionaryModal({ isOpen, onClose, customDict, onSaveCustomDict }) {
  if (!isOpen) return null;

  const [dictList, setDictList] = useState([...customDict]);
  const [newTerm, setNewTerm] = useState({ term: '', definition: '', category: '사내용어', phonetics: '' });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTerm.term.trim()) return;

    const phoneticsArr = newTerm.phonetics
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    const item = {
      term: newTerm.term,
      definition: newTerm.definition || '사내 고유 정의',
      category: newTerm.category || '사내용어',
      phonetics: phoneticsArr.length > 0 ? phoneticsArr : [newTerm.term]
    };

    setDictList([item, ...dictList]);
    setNewTerm({ term: '', definition: '', category: '사내용어', phonetics: '' });
  };

  const handleDelete = (index) => {
    setDictList(dictList.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSaveCustomDict(dictList);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dictList, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "company_dictionary.json");
    dlAnchorElem.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">사내 맞춤 용어 & 줄임말 사전 관리</h3>
              <p className="text-xs text-slate-400">사내 고유 프로젝트명, 약어, 인명 등을 등록하면 AI가 오인식 없이 정확히 전사합니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Jargon Form */}
        <form onSubmit={handleAdd} className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              placeholder="표준 표기 (예: A프로젝트)"
              value={newTerm.term}
              onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="음성 인식 유사발음/교정어 (쉼표 구분: 에이플젝, A플젝)"
              value={newTerm.phonetics}
              onChange={(e) => setNewTerm({ ...newTerm, phonetics: e.target.value })}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <select
              value={newTerm.category}
              onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value })}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="사내프로젝트">사내 프로젝트</option>
              <option value="임직원">임직원/조직</option>
              <option value="사내문화">사내 문화/회의</option>
              <option value="약어">약어/줄임말</option>
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="용어 의미/설명 (선택 사항)"
              value={newTerm.definition}
              onChange={(e) => setNewTerm({ ...newTerm, definition: e.target.value })}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> 추가
            </button>
          </div>
        </form>

        {/* Dictionary Table List */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2">
          {dictList.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{item.term}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                    {item.category}
                  </span>
                  {item.phonetics && item.phonetics.length > 0 && (
                    <span className="text-[11px] text-indigo-400 font-mono">
                      (인식 매핑: {item.phonetics.join(', ')})
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.definition}</p>
              </div>

              <button
                onClick={() => handleDelete(idx)}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {dictList.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              등록된 사내 맞춤 용어가 없습니다.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white border border-slate-800"
          >
            <Download className="w-3.5 h-3.5" /> JSON 내보내기
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            >
              {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? '저장 완료!' : '사전 저장하기'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
