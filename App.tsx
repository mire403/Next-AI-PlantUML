import React, { useState, useRef, useEffect } from 'react';
import AIPanel from './components/AIPanel';
import PreviewPanel from './components/PreviewPanel';
import TutorialPanel from './components/TutorialPanel';
import HistoryPanel from './components/HistoryPanel';
import OptimizationPanel from './components/OptimizationPanel';
import { Tab, HistoryItem } from './types';
import { Bot, BookOpen, PenTool, History, ScanEye } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // Actually we don't have uuid package, use simple id gen

const DEFAULT_CODE = `@startuml
skinparam monochrome true
skinparam shadowing false

actor 用户
participant "Next AI PlantUML" as AI
participant "PlantUML 服务" as Server

用户 -> AI : 需求 (文本/图片)
activate AI
AI -> AI : 分析 & 生成代码
AI --> 用户 : PlantUML 代码
deactivate AI

用户 -> Server : 请求图表
activate Server
Server --> 用户 : SVG 图片
deactivate Server
@enduml`;

// Simple ID generator since we can't install uuid
const generateId = () => Math.random().toString(36).substring(2, 9);

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.AI_GENERATOR);
  const [plantUMLCode, setPlantUMLCode] = useState<string>(DEFAULT_CODE);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Resizable Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(45); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load History from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('plantuml_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const handleHistoryAdd = (prompt: string, code: string) => {
    const newItem: HistoryItem = {
      id: generateId(),
      timestamp: Date.now(),
      prompt,
      code
    };
    const newHistory = [...history, newItem];
    setHistory(newHistory);
    localStorage.setItem('plantuml_history', JSON.stringify(newHistory));
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setPlantUMLCode(item.code);
    setActiveTab(Tab.AI_GENERATOR); // Switch back to editor to see result
  };

  const handleClearHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？')) {
        setHistory([]);
        localStorage.removeItem('plantuml_history');
    }
  };

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const newWidth = (e.clientX / containerWidth) * 100;
      // Limit width between 20% and 80%
      if (newWidth > 20 && newWidth < 80) {
        setSidebarWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  const renderTabContent = () => {
    switch (activeTab) {
        case Tab.HISTORY:
            return <HistoryPanel history={history} onSelect={handleHistorySelect} onClear={handleClearHistory} />;
        case Tab.AI_GENERATOR:
            return <AIPanel 
                currentCode={plantUMLCode} 
                onCodeChange={setPlantUMLCode}
                onHistoryAdd={handleHistoryAdd}
            />;
        case Tab.OPTIMIZATION:
            return <OptimizationPanel currentCode={plantUMLCode} />;
        case Tab.TUTORIAL:
            return <TutorialPanel />;
        default:
            return null;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100">
      
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <PenTool size={18} />
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Next AI <span className="text-indigo-600">PlantUML</span></h1>
                <span className="text-xs text-slate-400 font-medium mt-0.5">PlantUML AI辅助</span>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="flex-1 flex min-h-0 relative"
        style={{ cursor: isResizing ? 'col-resize' : 'default' }}
      >
        
        {/* Left Column (Controls) */}
        <div 
            className="flex flex-col border-r border-slate-200 h-full bg-white z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] min-w-[200px]"
            style={{ width: `${sidebarWidth}%` }}
        >
            
            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab(Tab.HISTORY)}
                    title="历史记录"
                    className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        activeTab === Tab.HISTORY
                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                >
                    <History size={16} />
                    <span>历史</span>
                </button>
                <button 
                    onClick={() => setActiveTab(Tab.AI_GENERATOR)}
                    title="AI 生成器"
                    className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        activeTab === Tab.AI_GENERATOR 
                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                >
                    <Bot size={16} />
                    <span>生成</span>
                </button>
                <button 
                    onClick={() => setActiveTab(Tab.OPTIMIZATION)}
                    title="AI 优化建议"
                    className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        activeTab === Tab.OPTIMIZATION
                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                >
                    <ScanEye size={16} />
                    <span>优化</span>
                </button>
                <button 
                    onClick={() => setActiveTab(Tab.TUTORIAL)}
                    title="教程"
                    className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        activeTab === Tab.TUTORIAL
                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                >
                    <BookOpen size={16} />
                    <span>教程</span>
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden relative">
                {renderTabContent()}
            </div>
        </div>

        {/* Resizer Handle */}
        <div 
            className="w-1 hover:w-2 bg-slate-200 hover:bg-indigo-400 cursor-col-resize transition-all z-20 flex items-center justify-center group absolute h-full top-0"
            style={{ left: `${sidebarWidth}%`, transform: 'translateX(-50%)' }}
            onMouseDown={startResizing}
        >
            <div className="h-8 w-1 bg-slate-400 rounded-full group-hover:bg-white" />
        </div>

        {/* Right Column (Preview) */}
        <div 
            className="h-full bg-slate-50 relative overflow-hidden"
            style={{ width: `${100 - sidebarWidth}%` }}
        >
            <PreviewPanel 
                code={plantUMLCode} 
                onCodeUpdate={(newCode) => setPlantUMLCode(newCode)}
            />
        </div>

      </div>
    </div>
  );
}

export default App;