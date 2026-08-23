import React, { useState } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  User, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Copy,
  LayoutGrid,
  List,
  Check
} from 'lucide-react';

export default function ActionItemsKanban({ 
  actionItems = [], 
  onUpdateActionItems,
  onCopyJira,
  onCopySlack
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [copiedType, setCopiedType] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo'
  });

  const columns = [
    { id: 'todo', title: '할 일 (To Do)', color: 'border-slate-700 bg-slate-900/50' },
    { id: 'in_progress', title: '진행 중 (In Progress)', color: 'border-indigo-500/40 bg-indigo-950/20' },
    { id: 'done', title: '완료됨 (Done)', color: 'border-emerald-500/40 bg-emerald-950/20' }
  ];

  const handleStatusChange = (id, newStatus) => {
    const updated = actionItems.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    );
    onUpdateActionItems(updated);
  };

  const handleDelete = (id) => {
    const updated = actionItems.filter(item => item.id !== id);
    onUpdateActionItems(updated);
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const item = {
      id: `ai-custom-${Date.now()}`,
      title: newTask.title,
      description: '사용자 직접 추가 과업',
      assignee: newTask.assignee || '미지정',
      priority: newTask.priority,
      dueDate: newTask.dueDate || '마감일 미정',
      status: newTask.status,
      jiraType: 'Task'
    };
    onUpdateActionItems([...actionItems, item]);
    setNewTask({ title: '', assignee: '', dueDate: '', priority: 'medium', status: 'todo' });
    setIsAddingNew(false);
  };

  const copyWithFeedback = (type, fn) => {
    fn();
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">자동 추출 액션 아이템 (Action Items Engine)</h3>
            <p className="text-[11px] text-slate-400">담당자, 마감기한, 우선순위가 자동 매핑된 업무 과제 목록입니다.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="칸반 보드 보기"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="리스트 보기"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Jira Export */}
          <button
            onClick={() => copyWithFeedback('jira', onCopyJira)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            {copiedType === 'jira' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Jira 복사</span>
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 태스크 추가</span>
          </button>
        </div>
      </div>

      {/* Add New Task Modal/Inline Form */}
      {isAddingNew && (
        <form onSubmit={handleAddNew} className="mb-5 p-4 rounded-xl bg-slate-950 border border-indigo-500/40 animate-fadeIn space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-300">새 액션 아이템 추가</h4>
            <button type="button" onClick={() => setIsAddingNew(false)} className="text-xs text-slate-500 hover:text-slate-300">닫기</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="과업 제목 (예: 결제 API 명세서 배포)"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="담당자 (예: 박백엔드)"
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="기한 (예: 내일 18:00)"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddingNew(false)} className="px-3 py-1 text-xs text-slate-400 hover:text-white">취소</button>
            <button type="submit" className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold">등록</button>
          </div>
        </form>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map(col => {
            const colItems = actionItems.filter(item => item.status === col.id);
            return (
              <div key={col.id} className={`rounded-xl border p-3.5 flex flex-col ${col.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    {col.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                    {colItems.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 min-h-[220px]">
                  {colItems.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 hover:border-slate-700 shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          item.priority === 'high' 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : (item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400')
                        }`}>
                          {item.priority === 'high' ? '긴급' : (item.priority === 'medium' ? '보통' : '여유')}
                        </span>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="bg-slate-900 text-[10px] text-slate-300 rounded border border-slate-700 px-1 py-0.5"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-slate-100 mb-1 leading-snug">{item.title}</h4>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed line-clamp-2">{item.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1 text-indigo-300 font-medium">
                          <User className="w-3 h-3 text-indigo-400" />
                          <span>@{item.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{item.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {colItems.length === 0 && (
                    <div className="h-full flex items-center justify-center text-slate-600 text-xs py-8">
                      태스크 없음
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {actionItems.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleStatusChange(item.id, item.status === 'done' ? 'todo' : 'done')}
                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                    item.status === 'done' ? 'bg-emerald-600 text-white' : 'border border-slate-700 hover:border-indigo-500'
                  }`}
                >
                  {item.status === 'done' && <Check className="w-3 h-3" />}
                </button>
                <div>
                  <h4 className={`text-xs font-bold ${item.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-indigo-300 font-medium">@{item.assignee}</span>
                <span className="text-slate-400 font-mono text-[11px]">{item.dueDate}</span>
                <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-rose-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
