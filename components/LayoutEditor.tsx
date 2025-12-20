import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from 'reactflow';
import { DiagramNode, parseEntities } from '../services/plantumlParser';
import { generateLayoutConstraints, applyLayoutToCode } from '../services/plantumlLayout';
import { Save, RefreshCw, Undo } from 'lucide-react';

interface LayoutEditorProps {
  code: string;
  onSave: (newCode: string) => void;
}

const LayoutEditor: React.FC<LayoutEditorProps> = ({ code, onSave }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize nodes from PlantUML code
  const initGraph = useCallback(() => {
    const entities = parseEntities(code);
    
    // Simple grid layout for initialization if no positions known
    // Real app might convert generated -[hidden] back to positions, 
    // but for now we just layout them in a grid to start dragging.
    const initialNodes: Node[] = entities.map((e, index) => ({
      id: e.id,
      position: { x: (index % 3) * 250 + 50, y: Math.floor(index / 3) * 150 + 50 },
      data: { label: `${e.type}: ${e.label}` },
      style: { 
        background: '#fff', 
        border: '1px solid #777', 
        borderRadius: '4px',
        padding: '10px',
        width: 180,
        fontSize: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      },
      type: 'default' // Simple input/output node
    }));

    setNodes(initialNodes);
    setEdges([]); // We don't visualize actual edges in Layout Mode to reduce clutter, strictly focus on positioning
    setIsDirty(false);
  }, [code, setNodes, setEdges]);

  // Load on mount
  useEffect(() => {
    initGraph();
  }, []);

  const handleSave = () => {
    const constraints = generateLayoutConstraints(nodes);
    const newCode = applyLayoutToCode(code, constraints);
    onSave(newCode);
    setIsDirty(false);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-100">
        {/* Toolbar */}
        <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-indigo-600 flex items-center gap-1">
                    🖱️ 交互式布局编辑器
                </span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    拖动节点调整位置 -> 保存生成约束
                </span>
            </div>
            <div className="flex gap-2">
                 <button 
                    onClick={initGraph}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
                >
                    <RefreshCw size={14} /> 重置画布
                </button>
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition-colors"
                >
                    <Save size={14} /> 应用并生成代码
                </button>
            </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 w-full h-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={(changes) => {
                    onNodesChange(changes);
                    setIsDirty(true);
                }}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background color="#ccc" gap={20} />
                <Controls position="top-left" />
            </ReactFlow>
            
            {/* Hint Overlay */}
            <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded border border-slate-200 shadow-lg max-w-sm pointer-events-none z-10">
                <p className="text-xs text-slate-600 font-semibold mb-1">💡 布局工作原理：</p>
                <ul className="text-[10px] text-slate-500 list-disc list-inside space-y-1">
                    <li>PlantUML 是自动布局，无法指定绝对坐标。</li>
                    <li>此编辑器将您的拖拽转换为 <code className="bg-slate-100 px-1">-[hidden]-</code> 相对位置约束。</li>
                    <li>如果您将 B 拖到 A 的右侧，系统会自动生成 <code className="bg-slate-100 px-1">A -[hidden]right-&gt; B</code>。</li>
                    <li>点击“应用”后，渲染结果可能与画布不完全一致，但相对结构会保持。</li>
                </ul>
            </div>
        </div>
    </div>
  );
};

export default LayoutEditor;