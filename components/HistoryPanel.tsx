import React from 'react';
import { HistoryItem } from '../types';
import { Clock, ChevronRight, FileCode, Trash2 } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center bg-slate-50">
        <Clock size={48} className="mb-4 opacity-20" />
        <p>暂无历史记录</p>
        <p className="text-xs mt-2">生成的图表将自动保存在这里</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
        <div>
            <h2 className="font-bold text-slate-800">历史记录</h2>
            <p className="text-xs text-slate-500">点击项目恢复代码</p>
        </div>
        <button 
            onClick={onClear}
            className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
            title="清空历史"
        >
            <Trash2 size={12} /> 清空
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {history.slice().reverse().map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
            
            <div className="font-medium text-slate-800 text-sm line-clamp-2 mb-2 leading-snug">
              {item.prompt || "无描述 (直接生成)"}
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 font-mono">
              <FileCode size={12} className="shrink-0 text-slate-400" />
              <span className="truncate opacity-80">{item.code.replace(/\n/g, ' ').substring(0, 30)}...</span>
            </div>
            
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;