import React, { useMemo, useState, useRef, useEffect } from 'react';
import { getDiagramUrl } from '../services/plantuml';
import { Download, ExternalLink, RefreshCw, ZoomIn, ZoomOut, Maximize, Move, LayoutDashboard, Eye, Copy, Check } from 'lucide-react';
import LayoutEditor from './LayoutEditor';

interface PreviewPanelProps {
  code: string;
  onCodeUpdate?: (newCode: string) => void; // Optional callback for updating code from layout editor
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, onCodeUpdate }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<'preview' | 'layout'>('preview');
  
  // Pan & Zoom State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Copy State
  const [isCopied, setIsCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const diagramUrl = useMemo(() => {
    return getDiagramUrl(code, 'svg');
  }, [code, refreshKey]);

  const pngUrl = useMemo(() => {
    return getDiagramUrl(code, 'png');
  }, [code, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCopyImage = async () => {
    try {
      const response = await fetch(pngUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy image:', error);
      alert('无法复制图片，可能是浏览器权限或跨域限制，请尝试下载。');
    }
  };

  // Reset Pan/Zoom when diagram changes or manually
  useEffect(() => {
    handleResetView();
  }, [diagramUrl]);

  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 5));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.1));

  // Mouse Events for Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode === 'layout') return; // Disable custom pan logic in layout mode (handled by React Flow)
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel Event for Zooming
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode === 'layout') return;
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(scale + delta, 0.1), 5);
        setScale(newScale);
    }
  };

  if (!code) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center border-l border-slate-200">
         <h3 className="text-lg font-medium">暂无图表生成</h3>
      </div>
    );
  }

  // Handle saving from layout editor
  const handleLayoutSave = (newCode: string) => {
      if (onCodeUpdate) {
          onCodeUpdate(newCode);
          setViewMode('preview'); // Switch back to see result
      }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 border-l border-slate-200">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 p-3 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-all ${
                        viewMode === 'preview' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Eye size={14} /> 预览
                </button>
                <button
                    onClick={() => setViewMode('layout')}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-all ${
                        viewMode === 'layout' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <LayoutDashboard size={14} /> 调整布局
                </button>
             </div>
             {viewMode === 'preview' && (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-mono">PlantUML渲染</span>
             )}
        </div>
        
        {viewMode === 'preview' && (
            <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 mx-2">
                    <button onClick={handleZoomOut} className="p-1 hover:bg-white rounded text-slate-600" title="缩小">
                        <ZoomOut size={16} />
                    </button>
                    <span className="text-xs w-10 text-center font-mono text-slate-600">{Math.round(scale * 100)}%</span>
                    <button onClick={handleZoomIn} className="p-1 hover:bg-white rounded text-slate-600" title="放大">
                        <ZoomIn size={16} />
                    </button>
                    <button onClick={handleResetView} className="p-1 hover:bg-white rounded text-slate-600 ml-1" title="重置视图">
                        <Maximize size={16} />
                    </button>
                </div>

                <div className="flex gap-1 border-l border-slate-200 pl-2">
                    <button 
                        onClick={handleRefresh}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="强制刷新"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button 
                        onClick={handleCopyImage}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="复制 PNG 图片"
                    >
                        {isCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    </button>
                    <a 
                        href={pngUrl} 
                        download="diagram.png"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="下载 PNG"
                    >
                        <Download size={18} />
                    </a>
                </div>
            </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-slate-50">
        
        {viewMode === 'layout' ? (
            <LayoutEditor code={code} onSave={handleLayoutSave} />
        ) : (
            /* Diagram Preview Canvas */
            <div 
                className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                ref={containerRef}
            >
                <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs text-slate-500 pointer-events-none border border-slate-200 flex items-center gap-1">
                    <Move size={12} />
                    <span>拖拽移动 / 滚轮缩放</span>
                </div>

                <div 
                    className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out origin-center"
                    style={{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` 
                    }}
                >
                    <div className="bg-white p-1 shadow-sm border border-slate-200">
                        <img 
                            src={diagramUrl} 
                            alt="PlantUML Diagram" 
                            className="max-w-none pointer-events-none select-none"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<p class="text-red-500 text-sm p-4">图表渲染失败。代码可能无效。</p>';
                            }}
                        />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;