import React from 'react';
import { 
  ArrowLeft, 
  MousePointer2, 
  Hand, 
  Plus, 
  Ruler, 
  Split, 
  Box, 
  Grid, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  ChevronRight,
  Eye,
  Settings,
  Search,
  Maximize,
  Map
} from 'lucide-react';
import { ViewMode } from '../../types';
import { EditorTool } from './EditorPage';

interface ToolbarProps {
  layoutName: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedTool: EditorTool;
  setSelectedTool: (tool: EditorTool) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  showRulers: boolean;
  setShowRulers: (show: boolean) => void;
  selectedNodeId: string | null;
  onBack: () => void;
  onAdd: () => void;
  onFitScreen: () => void;
}

export default function EditorToolbar({
  layoutName,
  viewMode,
  setViewMode,
  selectedTool,
  setSelectedTool,
  zoomLevel,
  setZoomLevel,
  showGrid,
  setShowGrid,
  snapToGrid,
  setSnapToGrid,
  gridSize,
  setGridSize,
  showRulers,
  setShowRulers,
  selectedNodeId,
  onBack,
  onAdd,
  onFitScreen
}: ToolbarProps) {
  return (
    <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col border-l border-slate-700 pl-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
             <span>Blueprint</span>
             <ChevronRight className="w-2.5 h-2.5" />
             <span className="text-sky-500">Workspace</span>
          </div>
          <h2 className="text-xs font-bold text-white uppercase tracking-tight">{layoutName}</h2>
        </div>

        <div className="h-6 w-px bg-slate-700 mx-2"></div>

        {/* View Switcher */}
        <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-800">
           <ViewModeBtn 
             active={viewMode === ViewMode.TOP_DOWN} 
             onClick={() => setViewMode(ViewMode.TOP_DOWN)}
             label="Top"
           />
           <ViewModeBtn 
             active={viewMode === ViewMode.FRONT} 
             onClick={() => setViewMode(ViewMode.FRONT)}
             label="Front"
           />
           <ViewModeBtn 
             active={viewMode === ViewMode.INTERIOR} 
             onClick={() => setViewMode(ViewMode.INTERIOR)}
             label="Interior"
           />
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-950/40 p-1.5 rounded-xl border border-slate-800 shadow-inner">
        <ToolBtn icon={<MousePointer2 className="w-4 h-4" />} active={selectedTool === 'select'} onClick={() => setSelectedTool('select')} title="Selection Tool" />
        <ToolBtn icon={<Hand className="w-4 h-4" />} active={selectedTool === 'pan'} onClick={() => setSelectedTool('pan')} title="Pan Tool" />
        <div className="w-px h-4 bg-slate-800 mx-1"></div>
        <ToolBtn 
          icon={<Plus className="w-4 h-4" />} 
          active={selectedTool === 'add'} 
          onClick={() => {
            setSelectedTool('add');
            onAdd();
          }} 
          color="sky"
          title="Add Custom Element"
        />
        <ToolBtn icon={<Ruler className="w-4 h-4" />} active={selectedTool === 'measure'} onClick={() => setSelectedTool('measure')} title="Measure Tool" />
        <ToolBtn icon={<Split className="w-4 h-4" />} active={selectedTool === 'split'} onClick={() => setSelectedTool('split')} title="Split / Divide" />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1">
           <div className="px-2 py-1 text-[9px] font-black text-slate-500 uppercase border-r border-slate-700 mr-1 flex items-center gap-2">
              <span className="text-sky-500">
                {viewMode === ViewMode.TOP_DOWN ? 'Top' : viewMode === ViewMode.FRONT ? 'Front' : 'Interior'}
              </span>
              <span className="text-[7px] text-slate-600 opacity-60">·</span>
              <span className="lowercase font-bold tracking-normal italic opacity-80">
                {viewMode === ViewMode.TOP_DOWN 
                  ? 'Floor plan' 
                  : viewMode === ViewMode.FRONT 
                    ? 'Width × Height' 
                    : 'Compartments and storage structure'}
              </span>
           </div>
           <button 
             onClick={onFitScreen}
             className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
             title="Fit to Screen"
           >
              <Maximize className="w-3.5 h-3.5" />
           </button>
           <div className="w-px h-4 bg-slate-700 mx-1"></div>
           <div className="flex items-center gap-1">
             <button onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))} className="p-1.5 text-slate-500 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
             <span className="text-[10px] font-mono font-bold text-slate-400 w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
             <button onClick={() => setZoomLevel(Math.min(5, zoomLevel + 0.1))} className="p-1.5 text-slate-500 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
           </div>
        </div>

        <div className="flex items-center gap-1 border-l border-slate-700 pl-3">
          {selectedNodeId && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-500/10 border border-sky-500/20 rounded-lg mr-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></div>
              <span className="text-[10px] font-black text-sky-400/80 uppercase">Selection</span>
            </div>
          )}
          <ToolbarToggle 
            icon={<Grid className="w-3.5 h-3.5" />} 
            active={showGrid} 
            onClick={() => setShowGrid(!showGrid)} 
            title="Toggle Grid"
          />
          <ToolbarToggle 
            icon={<Map className="w-3.5 h-3.5" />} 
            active={showRulers} 
            onClick={() => setShowRulers(!showRulers)} 
            title="Toggle Rulers"
          />
          
          <div className="flex items-center gap-1 ml-2 bg-slate-950/50 rounded-lg px-2 py-1 border border-slate-800">
             <span className="text-[8px] font-black text-slate-600 uppercase">Snap</span>
             <input 
               type="checkbox" 
               checked={snapToGrid} 
               onChange={(e) => setSnapToGrid(e.target.checked)}
               className="w-3 h-3 accent-sky-500"
             />
             <div className="w-px h-3 bg-slate-800 mx-1"></div>
             <select 
               value={gridSize} 
               onChange={(e) => setGridSize(Number(e.target.value))}
               className="bg-transparent text-[9px] font-bold text-slate-400 outline-none cursor-pointer"
             >
                <option value={10}>1cm</option>
                <option value={50}>5cm</option>
                <option value={100}>10cm</option>
                <option value={200}>20cm</option>
                <option value={500}>50cm</option>
                <option value={1000}>1m</option>
             </select>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-1.5 bg-sky-500 text-slate-900 rounded-lg font-bold text-xs hover:bg-sky-400 shadow-lg shadow-sky-500/20 transition-all ml-2">
          <Save className="w-3.5 h-3.5" />
          Commit
        </button>
      </div>
    </div>
  );
}

function ToolbarToggle({ icon, active, onClick, title }: { icon: React.ReactNode, active: boolean, onClick: () => void, title: string }) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-all ${active ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]' : 'text-slate-500 border border-transparent hover:bg-slate-800'}`}
    >
      {icon}
    </button>
  );
}

function ViewModeBtn({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`
        px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
        ${active ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}
      `}
    >
      {label}
    </button>
  );
}

function ToolBtn({ icon, active, onClick, color = 'slate', title }: { icon: React.ReactNode, active: boolean, onClick: () => void, color?: 'sky' | 'slate', title?: string }) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={`
        p-1.5 rounded-lg transition-all relative
        ${active 
          ? color === 'sky' ? 'bg-sky-500 text-slate-900 shadow-lg shadow-sky-500/40' : 'bg-slate-700 text-white shadow-lg' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}
      `}
    >
      {icon}
      {active && <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${color === 'sky' ? 'bg-slate-900' : 'bg-white'}`}></span>}
    </button>
  );
}
