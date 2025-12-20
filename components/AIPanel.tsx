import React, { useState, useRef } from 'react';
import { generateUML } from '../services/gemini';
import { Send, Image as ImageIcon, Loader2, Wand2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIPanelProps {
  currentCode: string;
  onCodeChange: (code: string) => void;
  onHistoryAdd: (prompt: string, code: string) => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ currentCode, onCodeChange, onHistoryAdd }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip prefix for Gemini API
        const base64Data = base64String.split(',')[1]; 
        setSelectedImage(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if ((!prompt.trim() && !selectedImage) || isLoading) return;

    setIsLoading(true);
    setFeedback('');

    try {
      const fullPrompt = prompt || "Generate a PlantUML diagram from the attached image.";
      const result = await generateUML(fullPrompt, selectedImage || undefined);
      
      onCodeChange(result.code);
      setFeedback(result.explanation);
      
      // Save to History
      onHistoryAdd(fullPrompt, result.code);

    } catch (error: any) {
      setFeedback(`**错误:** ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      
      {/* 1. Code Editor Area */}
      <div className="flex-1 flex flex-col min-h-0 border-b border-slate-200">
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PlantUML 源码</span>
            <span className="text-xs text-slate-400">可编辑</span>
        </div>
        <textarea
          value={currentCode}
          onChange={(e) => onCodeChange(e.target.value)}
          className="flex-1 w-full p-4 resize-none focus:outline-none text-sm leading-relaxed bg-white text-slate-800"
          spellCheck={false}
          placeholder="@startuml\n\n@enduml"
        />
      </div>

      {/* 2. AI Interaction Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
        
        {/* Feedback Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {feedback ? (
             <div className="prose prose-sm max-w-none text-slate-700 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-indigo-600 font-semibold border-b border-slate-100 pb-2">
                    <Wand2 size={16} />
                    <span>AI 架构师反馈</span>
                </div>
                <ReactMarkdown>{feedback}</ReactMarkdown>
             </div>
          ) : (
            <div className="text-center mt-10 text-slate-400">
                <p>在下方输入需求以生成图表。</p>
                <p className="text-xs mt-2">示例：“设计一个图书管理系统的类图”</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
            {/* Image Preview */}
            {selectedImage && (
                <div className="mb-3 flex items-start">
                    <div className="relative group">
                        <img 
                            src={`data:image/png;base64,${selectedImage}`} 
                            alt="Upload preview" 
                            className="h-16 w-16 object-cover rounded border border-slate-300"
                        />
                        <button 
                            onClick={handleClearImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"
                        >
                            <X size={12} />
                        </button>
                    </div>
                    <span className="ml-2 text-xs text-slate-500 self-center">已附图片</span>
                </div>
            )}

            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="描述您的系统或上传草图..."
                        className="w-full p-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-sm h-24"
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                     <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-3 right-3 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="上传图片"
                    >
                        <ImageIcon size={20} />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
                
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || (!prompt && !selectedImage)}
                    className={`px-4 rounded-lg flex items-center justify-center transition-all ${
                        isLoading || (!prompt && !selectedImage)
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                    }`}
                >
                    {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                </button>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex justify-between">
                <span>支持文本和图片</span>
                <span>按 Ctrl+Enter 发送</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;