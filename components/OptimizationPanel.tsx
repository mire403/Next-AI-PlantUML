import React, { useState } from 'react';
import { generateVisualReview } from '../services/gemini';
import { fetchDiagramImageBase64 } from '../services/plantuml';
import { ScanEye, Loader2, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface OptimizationPanelProps {
  currentCode: string;
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({ currentCode }) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleVisualReview = async () => {
    if (!currentCode.trim()) {
        setError("暂无代码可供分析。请先在生成器中生成图表。");
        return;
    }
    
    setIsReviewing(true);
    setError(null);
    setReviewResult('');
    
    try {
      // 1. Fetch the rendered image
      const imageBase64 = await fetchDiagramImageBase64(currentCode);
      
      // 2. Send to Gemini
      const critique = await generateVisualReview(imageBase64, currentCode);
      
      setReviewResult(critique);
    } catch (err: any) {
      setError(err.message || "评审失败，请稍后重试。");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
        <div className="p-6 border-b border-slate-100 shrink-0">
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <ScanEye className="text-indigo-600" />
                AI 优化建议
            </h2>
            <p className="text-sm text-slate-600">
                AI 将基于<strong>渲染后的图像</strong>对图表进行视觉与结构评审，并提供专业改进建议。
            </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {!reviewResult && !isReviewing && (
                <div className="flex flex-col items-center justify-center h-full py-8">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600 border border-indigo-100 shadow-sm">
                        <ScanEye size={32} />
                    </div>
                    <h3 className="text-slate-800 font-medium mb-2">准备就绪</h3>
                    <p className="text-slate-500 text-sm max-w-xs text-center mb-6 leading-relaxed">
                        点击下方按钮，AI 将分析右侧预览窗口中的实际渲染效果。
                    </p>
                    <button 
                        onClick={handleVisualReview}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md flex items-center gap-2"
                    >
                        开始视觉评审
                    </button>
                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-red-700 text-xs max-w-xs text-left">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <div>{error}</div>
                        </div>
                    )}
                </div>
            )}

            {isReviewing && (
                <div className="flex flex-col items-center justify-center h-full py-12 space-y-4">
                    <Loader2 size={40} className="animate-spin text-indigo-600" />
                    <div className="text-center space-y-1">
                        <p className="text-slate-800 font-medium">正在分析图表...</p>
                        <p className="text-slate-500 text-xs">AI 正在检查布局拥挤度、连线交叉和配色方案</p>
                    </div>
                </div>
            )}

            {reviewResult && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium border border-green-200 shadow-sm">
                        <CheckCircle2 size={16} />
                        评审完成
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-700 prose-headings:text-slate-900 prose-headings:font-bold prose-p:leading-relaxed bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <ReactMarkdown>{reviewResult}</ReactMarkdown>
                    </div>
                    <button 
                        onClick={handleVisualReview}
                        className="w-full py-3 text-sm text-slate-500 hover:text-indigo-600 border border-dashed border-slate-300 hover:border-indigo-300 rounded-lg transition-colors flex items-center justify-center gap-2 bg-white"
                    >
                        <RefreshCw size={14} /> 重新分析当前图表
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default OptimizationPanel;