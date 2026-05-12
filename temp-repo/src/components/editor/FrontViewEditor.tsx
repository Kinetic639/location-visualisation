import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Columns, 
  Rows, 
  Trash2, 
  Link as LinkIcon, 
  Unlink, 
  Plus, 
  ChevronRight,
  Maximize2,
  Sparkles,
  MousePointer2,
  Hand,
  GripHorizontal,
  GripVertical,
  Check,
  Settings2,
  LayoutGrid,
  Info,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  Layers,
  Box as BoxIcon,
  MousePointer
} from 'lucide-react';
import { VisualNode, StructureNode, LogicalLocation, LayoutSplitDivider } from '../../types';
import { cn } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface FrontViewEditorProps {
  node: VisualNode;
  locations: LogicalLocation[];
  onUpdateNode: (id: string, updates: Partial<VisualNode>) => void;
  onAddLocations?: (locations: LogicalLocation[]) => void;
}

const CORNER_PRESETS = [
  { id: 'sharp', label: 'Sharp', values: [0, 0, 0, 0] },
  { id: 'slightly_rounded', label: 'Slightly Rounded', values: [4, 4, 4, 4] },
  { id: 'rounded', label: 'Rounded', values: [12, 12, 12, 12] },
  { id: 'modern_cabinet', label: 'Modern Cabinet', values: [8, 8, 8, 8] },
  { id: 'plastic_bin', label: 'Plastic Bin', values: [24, 24, 24, 24] },
  { id: 'soft_industrial', label: 'Soft Industrial', values: [4, 4, 16, 16] },
];

function FrontSetupWizard({ 
  node, 
  locations, 
  onComplete,
  wizardStep,
  setWizardStep,
  setupData,
  setSetupData
}: { 
  node: VisualNode; 
  locations: LogicalLocation[]; 
  onComplete: () => void;
  wizardStep: number;
  setWizardStep: React.Dispatch<React.SetStateAction<number>>;
  setupData: any;
  setSetupData: React.Dispatch<React.SetStateAction<any>>;
}) {
  const linkedLoc = node.locationId ? locations.find(l => l.id === node.locationId) : null;
  const [selectedCorner, setSelectedCorner] = useState<string | null>(null);
  
  const inputRefs = {
    cornerRadiusTopLeft: useRef<HTMLInputElement>(null),
    cornerRadiusTopRight: useRef<HTMLInputElement>(null),
    cornerRadiusBottomLeft: useRef<HTMLInputElement>(null),
    cornerRadiusBottomRight: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (selectedCorner && (inputRefs as any)[selectedCorner]?.current) {
      (inputRefs as any)[selectedCorner].current.focus();
      (inputRefs as any)[selectedCorner].current.select();
    }
  }, [selectedCorner]);

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#020617] p-8 overflow-y-auto">
      <div className="max-w-2xl w-full flex flex-col gap-8 py-12">
        {/* Context Summary */}
        <div className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
           <div className="p-4 bg-sky-500/10 rounded-3xl border border-sky-500/20">
              <BoxIcon className="w-8 h-8 text-sky-400" />
           </div>
           <div className="flex-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Context Identification</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">{node.label}</h3>
                {linkedLoc && (
                  <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                    Linked: {linkedLoc.code}
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                 <span>Footprint: {node.frontSetupDone ? node.width : node.width / 10}x{node.frontSetupDone ? node.depth : (node.depth || 0) / 10}cm</span>
                 <span className="w-1 h-1 rounded-full bg-slate-800" />
                 <span>Rotation: {node.rotation}°</span>
              </div>
           </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map(step => (
            <div 
              key={step} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= wizardStep ? 'bg-sky-500' : 'bg-slate-800'}`} 
            />
          ))}
        </div>

        <motion.div
          key={wizardStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          {wizardStep === 1 && (
            <>
              <div className="space-y-2">
                <span className="text-sky-400 font-black text-[10px] uppercase tracking-widest">Step 1 of 4</span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Logical Dimensions</h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Set the physical scale of this object's front face. Width and Depth are prefilled from its top-down footprint.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Front Height (cm)</label>
                  <input 
                    type="number"
                    step="0.1"
                    required
                    value={setupData.height}
                    onChange={(e) => setSetupData((prev: any) => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl px-6 py-4 text-white font-black text-xl outline-none focus:ring-2 focus:ring-sky-500 tracking-tight"
                    placeholder="e.g. 200"
                  />
                  <div className="flex gap-2">
                    {[120, 180, 200, 240].map(h => (
                      <button 
                        key={h}
                        onClick={() => setSetupData((prev: any) => ({ ...prev, height: h }))}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                      Front Width (cm)
                      <button 
                        onClick={() => setSetupData((prev: any) => ({ ...prev, useCustomWidth: !prev.useCustomWidth, width: node.frontSetupDone ? node.width : node.width / 10 }))}
                        className={`text-[9px] lowercase italic transition-colors ${setupData.useCustomWidth ? 'text-sky-400' : 'text-slate-600'}`}
                      >
                        {setupData.useCustomWidth ? 'sync with footprint' : 'use custom width'}
                      </button>
                    </label>
                    <input 
                      type="number"
                      step="0.1"
                      disabled={!setupData.useCustomWidth}
                      value={setupData.width}
                      onChange={(e) => setSetupData((prev: any) => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                      className={`w-full bg-slate-900 border border-slate-700/50 rounded-2xl px-6 py-4 text-white font-black text-xl outline-none transition-all tracking-tight ${!setupData.useCustomWidth ? 'opacity-30 cursor-not-allowed' : 'focus:ring-2 focus:ring-sky-500'}`}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Footprint Depth (cm)</label>
                    <div className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl px-6 py-4 text-slate-500 font-black text-xl opacity-30 select-none tracking-tight">
                      {node.frontSetupDone ? node.depth : (node.depth || 0) / 10}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {wizardStep === 2 && (
            <>
              <div className="space-y-2">
                <span className="text-sky-400 font-black text-[10px] uppercase tracking-widest">Step 2 of 4</span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Front Orientation</h2>
                <p className="text-slate-400 text-sm font-medium">
                  Which side of the top-down footprint represents the "Front" face you are editing?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 items-center">
                <div className="bg-slate-900 aspect-square rounded-[3rem] border border-slate-800 relative flex items-center justify-center p-12 overflow-hidden">
                   <div 
                     className="absolute inset-x-12 inset-y-16 border-2 border-slate-700 rounded-xl bg-slate-950 flex items-center justify-center shadow-2xl transition-transform duration-500"
                     style={{ transform: `rotate(${node.rotation}deg)` }}
                   >
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest rotate-[-90deg]">FOOTPRINT</span>
                      
                      {/* Highlights */}
                      <div className={`absolute bottom-0 inset-x-0 h-1 bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)] transition-opacity duration-300 ${setupData.frontSide === 'bottom' ? 'opacity-100' : 'opacity-0'}`} />
                      <div className={`absolute top-0 inset-x-0 h-1 bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)] transition-opacity duration-300 ${setupData.frontSide === 'top' ? 'opacity-100' : 'opacity-0'}`} />
                      <div className={`absolute left-0 inset-y-0 w-1 bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)] transition-opacity duration-300 ${setupData.frontSide === 'left' ? 'opacity-100' : 'opacity-0'}`} />
                      <div className={`absolute right-0 inset-y-0 w-1 bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)] transition-opacity duration-300 ${setupData.frontSide === 'right' ? 'opacity-100' : 'opacity-0'}`} />
                   </div>

                   <button onClick={() => setSetupData((prev: any) => ({ ...prev, frontSide: 'top' }))} className={`absolute top-4 left-1/2 -translate-x-1/2 p-4 rounded-2xl border transition-all ${setupData.frontSide === 'top' ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-slate-800 text-slate-500 border-slate-750 hover:bg-slate-700'}`}>
                      <ArrowUp className="w-6 h-6" />
                   </button>
                   <button onClick={() => setSetupData((prev: any) => ({ ...prev, frontSide: 'bottom' }))} className={`absolute bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-2xl border transition-all ${setupData.frontSide === 'bottom' ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-slate-800 text-slate-500 border-slate-750 hover:bg-slate-700'}`}>
                      <ArrowDown className="w-6 h-6" />
                   </button>
                   <button onClick={() => setSetupData((prev: any) => ({ ...prev, frontSide: 'left' }))} className={`absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl border transition-all ${setupData.frontSide === 'left' ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-slate-800 text-slate-500 border-slate-750 hover:bg-slate-700'}`}>
                      <ArrowLeft className="w-6 h-6" />
                   </button>
                   <button onClick={() => setSetupData((prev: any) => ({ ...prev, frontSide: 'right' }))} className={`absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl border transition-all ${setupData.frontSide === 'right' ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-slate-800 text-slate-500 border-slate-750 hover:bg-slate-700'}`}>
                      <ArrowRight className="w-6 h-6" />
                   </button>
                </div>

                <div className="space-y-4">
                   <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                      Current selection: <span className="text-sky-400 uppercase">{setupData.frontSide} edge</span>. 
                      Usually, this is determined by the aisle facing. If this is a static rack, Choose bottom for the default front projection.
                   </p>
                </div>
              </div>
            </>
          )}

          {wizardStep === 3 && (
            <>
              <div className="space-y-2">
                <span className="text-sky-400 font-black text-[10px] uppercase tracking-widest">Step 3 of 4</span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Internal Structure</h2>
                <p className="text-slate-400 text-sm font-medium">
                  Choose a starting template for the front view of this object.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'blank', label: 'Blank', icon: <BoxIcon /> },
                  { id: 'shelves', label: 'Shelves', icon: <Rows /> },
                  { id: 'columns', label: 'Columns', icon: <Columns /> },
                  { id: 'grid', label: 'Grid', icon: <Grid3X3 /> },
                  { id: 'wall_bins', label: 'Wall Bins', icon: <Plus /> },
                  { id: 'pallet_rack', label: 'Pallet Rack', icon: <Layers /> },
                ].map(tmpl => (
                  <button 
                    key={tmpl.id}
                    onClick={() => setSetupData((prev: any) => ({ ...prev, template: tmpl.id as any }))}
                    className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all ${setupData.template === tmpl.id ? 'bg-sky-500/10 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700'}`}
                  >
                    {React.cloneElement(tmpl.icon as React.ReactElement<any>, { className: 'w-8 h-8' })}
                    <span className="text-[10px] font-black uppercase tracking-widest">{tmpl.label}</span>
                  </button>
                ))}
              </div>

              {(setupData.template === 'shelves' || setupData.template === 'rows' || setupData.template === 'grid' || setupData.template === 'wall_bins') && (
                <div className="p-6 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center gap-8">
                   <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Number of Rows/Levels</label>
                      <input 
                        type="range" min="1" max="15" step="1"
                        value={setupData.rowCount}
                        onChange={(e) => setSetupData((prev: any) => ({ ...prev, rowCount: parseInt(e.target.value) }))}
                        className="w-full accent-sky-500"
                      />
                   </div>
                   <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl font-black text-white">
                      {setupData.rowCount}
                   </div>
                </div>
              )}

              {(setupData.template === 'columns' || setupData.template === 'grid' || setupData.template === 'wall_bins') && (
                <div className="p-6 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center gap-8">
                   <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Number of Columns</label>
                      <input 
                        type="range" min="1" max="15" step="1"
                        value={setupData.colCount}
                        onChange={(e) => setSetupData((prev: any) => ({ ...prev, colCount: parseInt(e.target.value) }))}
                        className="w-full accent-sky-500"
                      />
                   </div>
                   <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl font-black text-white">
                      {setupData.colCount}
                   </div>
                </div>
              )}

              <div className="p-6 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-[11px] font-black text-white uppercase tracking-tight">Sync Inventory logic</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">Create logical storage units matching visual nodes</p>
                 </div>
                 <button 
                   onClick={() => setSetupData((prev: any) => ({ ...prev, generateLocations: !prev.generateLocations }))}
                   className={`w-12 h-6 rounded-full transition-all relative ${setupData.generateLocations ? 'bg-sky-500' : 'bg-slate-800'}`}
                 >
                   <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${setupData.generateLocations ? 'left-7' : 'left-1'}`} />
                 </button>
              </div>
            </>
          )}

          {wizardStep === 4 && (
            <>
              <div className="space-y-2">
                <span className="text-sky-400 font-black text-[10px] uppercase tracking-widest">Step 4 of 5</span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Dividers & Frame</h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Configure structural elements like shelf boards, rack beams, or outer frames.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 {/* Left Column: Frame */}
                 <div className="space-y-6 p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <h4 className="text-sm font-black text-white uppercase tracking-tight italic">Outer Frame</h4>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Border around the object</p>
                       </div>
                       <button 
                         onClick={() => setSetupData((prev: any) => ({ ...prev, hasFrame: !prev.hasFrame }))}
                         className={`w-12 h-6 rounded-full transition-all relative ${setupData.hasFrame ? 'bg-sky-500' : 'bg-slate-800'}`}
                       >
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${setupData.hasFrame ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>

                    {setupData.hasFrame && (
                       <motion.div 
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         className="space-y-4 pt-4 border-t border-slate-800 overflow-hidden"
                       >
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Frame Thickness (cm)</label>
                             <input 
                               type="number"
                               step="0.1"
                               value={setupData.frameThickness}
                               onChange={(e) => setSetupData((prev: any) => ({ ...prev, frameThickness: parseFloat(e.target.value) || 0 }))}
                               className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-black text-xs outline-none focus:ring-1 focus:ring-sky-500"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Frame Type</label>
                             <div className="grid grid-cols-2 gap-2">
                                {['solid', 'gap'].map(type => (
                                   <button 
                                     key={type}
                                     onClick={() => setSetupData((prev: any) => ({ ...prev, frameType: type as any }))}
                                     className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${setupData.frameType === type ? 'bg-sky-500 border-sky-400 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                   >
                                      {type}
                                   </button>
                                ))}
                             </div>
                          </div>
                       </motion.div>
                    )}
                 </div>

                 {/* Right Column: Dividers */}
                 <div className="space-y-6 p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-xl">
                    <div className="space-y-1">
                       <h4 className="text-sm font-black text-white uppercase tracking-tight italic">Internal Dividers</h4>
                       <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Thickness between sections</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-800">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Divider Thickness (cm)</label>
                          <input 
                            type="number"
                            step="0.1"
                            value={setupData.dividerThickness}
                            onChange={(e) => setSetupData((prev: any) => ({ ...prev, dividerThickness: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-black text-xs outline-none focus:ring-1 focus:ring-sky-500"
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Divider Type</label>
                          <div className="grid grid-cols-2 gap-2">
                             {['solid', 'gap'].map(type => (
                                <button 
                                  key={type}
                                  onClick={() => setSetupData((prev: any) => ({ ...prev, dividerType: type as any }))}
                                  className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${setupData.dividerType === type ? 'bg-sky-500 border-sky-400 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                >
                                   {type}
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Material</label>
                          <select 
                            value={setupData.dividerMaterial}
                            onChange={(e) => setSetupData((prev: any) => ({ ...prev, dividerMaterial: e.target.value as any }))}
                            className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-black text-[10px] uppercase tracking-widest outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                          >
                             <option value="wood">Wood (1.8cm typical)</option>
                             <option value="metal">Metal (Industrial)</option>
                             <option value="plastic">Plastic (Bins)</option>
                             <option value="empty">Empty (Gap)</option>
                             <option value="custom">Custom</option>
                          </select>
                       </div>
                    </div>
                 </div>
              </div>
            </>
          )}

          {wizardStep === 5 && (
            <>
              <div className="space-y-2">
                <span className="text-sky-400 font-black text-[10px] uppercase tracking-widest">Step 5 of 5</span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Front Shape & Corners</h2>
                <p className="text-slate-400 text-sm font-medium">
                  Define the visual rounding of this object's front projection.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 items-start">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                       <div className="flex items-center gap-3">
                          {setupData.isCornerRadiusLocked ? <LinkIcon className="w-4 h-4 text-sky-400" /> : <Unlink className="w-4 h-4 text-slate-500" />}
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Lock Corners</span>
                       </div>
                       <button 
                         onClick={() => setSetupData((prev: any) => ({ ...prev, isCornerRadiusLocked: !prev.isCornerRadiusLocked }))}
                         className={`w-10 h-5 rounded-full transition-all relative ${setupData.isCornerRadiusLocked ? 'bg-sky-500' : 'bg-slate-800'}`}
                       >
                         <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${setupData.isCornerRadiusLocked ? 'left-6' : 'left-1'}`} />
                       </button>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Presets</label>
                       <div className="grid grid-cols-2 gap-2">
                          {CORNER_PRESETS.map(preset => (
                            <button 
                              key={preset.id}
                              onClick={() => setSetupData((prev: any) => ({
                                ...prev,
                                cornerRadiusTopLeft: preset.values[0],
                                cornerRadiusTopRight: preset.values[1],
                                cornerRadiusBottomRight: preset.values[2],
                                cornerRadiusBottomLeft: preset.values[3],
                              }))}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all text-left"
                            >
                              {preset.label}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-800">
                       {setupData.isCornerRadiusLocked ? (
                         <div className="space-y-3">
                            <div className="flex justify-between items-center">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Corner Radius</label>
                               <span className="text-xs font-black text-sky-400">{setupData.cornerRadiusTopLeft}px</span>
                            </div>
                            <input 
                              type="range" min="0" max="100" step="1"
                              value={setupData.cornerRadiusTopLeft}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setSetupData((prev: any) => ({
                                  ...prev,
                                  cornerRadiusTopLeft: val,
                                  cornerRadiusTopRight: val,
                                  cornerRadiusBottomRight: val,
                                  cornerRadiusBottomLeft: val,
                                }));
                              }}
                              className="w-full accent-sky-500"
                            />
                         </div>
                       ) : (
                         <div className="grid grid-cols-2 gap-4">
                            {[
                              { id: 'cornerRadiusTopLeft', label: 'Top Left' },
                              { id: 'cornerRadiusTopRight', label: 'Top Right' },
                              { id: 'cornerRadiusBottomLeft', label: 'Bottom Left' },
                              { id: 'cornerRadiusBottomRight', label: 'Bottom Right' },
                            ].map(corner => (
                              <div 
                                key={corner.id} 
                                className={`space-y-2 p-3 rounded-2xl border transition-all ${selectedCorner === corner.id ? 'bg-sky-500/5 border-sky-500/50' : 'bg-transparent border-transparent'}`}
                              >
                                 <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-between">
                                   {corner.label}
                                   {selectedCorner === corner.id && <MousePointer className="w-3 h-3 text-sky-400" />}
                                 </label>
                                 <input 
                                   ref={(inputRefs as any)[corner.id]}
                                   type="number"
                                   value={(setupData as any)[corner.id]}
                                   onFocus={() => setSelectedCorner(corner.id)}
                                   onChange={(e) => setSetupData((prev: any) => ({ ...prev, [corner.id]: parseInt(e.target.value) || 0 }))}
                                   className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-black text-white outline-none focus:ring-1 focus:ring-sky-500"
                                 />
                              </div>
                            ))}
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Live Preview</label>
                    <div className="aspect-[4/3] bg-slate-950 rounded-[2.5rem] border border-slate-800 flex items-center justify-center p-8 relative overflow-hidden">
                       <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #808080 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                       <div 
                         className="bg-sky-500/10 border-2 border-sky-500/40 relative shadow-2xl shadow-sky-500/5 transition-all duration-300 overflow-hidden"
                         style={{
                            width: '80%',
                            height: '80%',
                            borderTopLeftRadius: `${setupData.cornerRadiusTopLeft}px`,
                            borderTopRightRadius: `${setupData.cornerRadiusTopRight}px`,
                            borderBottomRightRadius: `${setupData.cornerRadiusBottomRight}px`,
                            borderBottomLeftRadius: `${setupData.cornerRadiusBottomLeft}px`,
                         }}
                       >
                          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px opacity-20">
                             {Array.from({ length: 9 }).map((_, i) => (
                               <div key={i} className="border border-sky-400/20" />
                             ))}
                          </div>
                          
                          {/* Corner selection areas */}
                          {!setupData.isCornerRadiusLocked && (
                            <div className="absolute inset-0 z-10">
                              <div 
                                onClick={() => setSelectedCorner('cornerRadiusTopLeft')}
                                className={`absolute top-0 left-0 w-1/3 h-1/3 cursor-pointer transition-colors ${selectedCorner === 'cornerRadiusTopLeft' ? 'bg-sky-500/10' : 'hover:bg-sky-500/5'}`} 
                              />
                              <div 
                                onClick={() => setSelectedCorner('cornerRadiusTopRight')}
                                className={`absolute top-0 right-0 w-1/3 h-1/3 cursor-pointer transition-colors ${selectedCorner === 'cornerRadiusTopRight' ? 'bg-sky-500/10' : 'hover:bg-sky-500/5'}`} 
                              />
                              <div 
                                onClick={() => setSelectedCorner('cornerRadiusBottomLeft')}
                                className={`absolute bottom-0 left-0 w-1/3 h-1/3 cursor-pointer transition-colors ${selectedCorner === 'cornerRadiusBottomLeft' ? 'bg-sky-500/10' : 'hover:bg-sky-500/5'}`} 
                              />
                              <div 
                                onClick={() => setSelectedCorner('cornerRadiusBottomRight')}
                                className={`absolute bottom-0 right-0 w-1/3 h-1/3 cursor-pointer transition-colors ${selectedCorner === 'cornerRadiusBottomRight' ? 'bg-sky-500/10' : 'hover:bg-sky-500/5'}`} 
                              />
                            </div>
                          )}
                       </div>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 italic text-center">
                      {setupData.isCornerRadiusLocked ? 'Preview reflects chosen corner shape' : 'Click corners in preview to select'}
                    </p>
                 </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Actions */}
        <div className="pt-8 border-t border-slate-800 flex justify-between items-center bg-[#020617] sticky bottom-0 py-8">
          <button 
            onClick={() => {
              if (wizardStep === 1) {
                // Cancel view mode change? Actually we should just let them return
              } else {
                setWizardStep(prev => prev - 1);
              }
            }}
            className="px-8 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
          >
            {wizardStep === 1 ? 'Discard Setup' : 'Back'}
          </button>
          <button 
            onClick={() => {
              if (wizardStep === 5) {
                onComplete();
              } else {
                setWizardStep(prev => prev + 1);
              }
            }}
            disabled={wizardStep === 1 && setupData.height <= 0}
            className="px-12 py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-sky-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {wizardStep === 5 ? 'Initialize Projection' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FrontViewEditor({ node, locations, onUpdateNode, onAddLocations }: FrontViewEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [selectedDividerId, setSelectedDividerId] = useState<string | null>(null);
  const [selectedFrameEdge, setSelectedFrameEdge] = useState<{ nodeId: string, edge: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [baseScale, setBaseScale] = useState(1);
  const [showNamingPanel, setShowNamingPanel] = useState<{ id: string, direction: 'horizontal' | 'vertical' } | null>(null);

  const [namingConfig, setNamingConfig] = useState({
    type: 'rows' as StructureNode['splitType'],
    prefix: '',
    startNumber: 1,
    padding: 0,
    count: 2
  });

  // Setup Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [setupData, setSetupData] = useState({
    width: node.frontSetupDone ? node.width : node.width / 10,
    height: node.frontSetupDone ? (node.height || node.width) : (node.width / 10),
    depth: (node.frontSetupDone ? node.depth : node.depth / 10) || 0,
    useCustomWidth: false,
    frontSide: node.frontSide || 'bottom',
    template: 'shelves' as 'blank' | 'shelves' | 'rows' | 'columns' | 'grid' | 'wall_bins' | 'pallet_rack' | 'drawer_cabinet' | 'custom',
    generateLocations: false,
    rowCount: 5,
    colCount: 3,
    dividerThickness: 1.8,
    dividerType: 'solid' as 'solid' | 'gap',
    dividerMaterial: 'wood' as any,
    hasFrame: true,
    frameThickness: 2.0,
    frameType: 'solid' as 'solid' | 'gap',
    cornerRadiusTopLeft: node.style?.cornerRadiusTopLeft || 0,
    cornerRadiusTopRight: node.style?.cornerRadiusTopRight || 0,
    cornerRadiusBottomRight: node.style?.cornerRadiusBottomRight || 0,
    cornerRadiusBottomLeft: node.style?.cornerRadiusBottomLeft || 0,
    isCornerRadiusLocked: node.style?.isCornerRadiusLocked ?? true,
  });

  const resizeTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({
            width: clientWidth,
            height: clientHeight
          });
        }
      }
    };
    
    // Initial call to catch current size
    updateDimensions();
    
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    // Extra check after setup to ensure layout has settled
    const timeout = setTimeout(updateDimensions, 100);
    
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [node.frontSetupDone]); // Re-run when setup state changes to catch the new containerRef

  const fitToScreen = () => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      const padding = 120;
      const targetWidth = node.width || 1000;
      const targetHeight = node.height || 2000;
      
      const scaleX = (dimensions.width - padding) / targetWidth;
      const scaleY = (dimensions.height - padding) / targetHeight;
      const fitScale = Math.min(scaleX, scaleY);
      
      setBaseScale(fitScale);
      setZoomLevel(1);
      setPan({
        x: (dimensions.width - targetWidth * fitScale) / 2,
        y: (dimensions.height - targetHeight * fitScale) / 2
      });
    }
  };

  // Initial fit logic - robust trigger
  useEffect(() => {
    if (node.frontSetupDone && dimensions.width > 0) {
      // Use a small delay for the very first fit after setup to ensure everything is rendered
      const timer = setTimeout(fitToScreen, 60);
      return () => clearTimeout(timer);
    }
  }, [node.id, node.frontSetupDone, dimensions.width, dimensions.height, node.width, node.height]);

  // Total scale (cumulative)
  const totalScale = useMemo(() => baseScale * zoomLevel, [baseScale, zoomLevel]);

  // Local state for the structure to avoid constant top-level re-renders during interactive operations
  const [localStructure, setLocalStructure] = useState<StructureNode>(() => {
    if (node.structure) return node.structure;
    return {
      id: `root-${node.id}`,
      type: 'cell' as const,
      size: 1,
      label: node.label
    };
  });

  // Keep local structure in sync with prop updates (but not vice versa to allow local editing)
  useEffect(() => {
    if (node.structure) {
      setLocalStructure(node.structure);
    }
  }, [node.id, node.structure]);

  const updateStructure = (newStructure: StructureNode) => {
    setLocalStructure(newStructure);
    // Debounced global update
    if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    resizeTimeoutRef.current = setTimeout(() => {
      onUpdateNode(node.id, { structure: newStructure });
    }, 200);
  };

  const structure = localStructure;

  const findNodeById = (root: StructureNode, id: string): StructureNode | null => {
    if (root.id === id) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const replaceNodeById = (root: StructureNode, id: string, newNode: StructureNode): StructureNode => {
    if (root.id === id) return newNode;
    if (root.children) {
      return {
        ...root,
        children: root.children.map(child => replaceNodeById(child, id, newNode))
      };
    }
    return root;
  };

  const updateCell = (id: string, updates: Partial<StructureNode>) => {
    const target = findNodeById(structure, id);
    if (!target) return;
    updateStructure(replaceNodeById(structure, id, { ...target, ...updates }));
  };

  const handleBatchMap = () => {
    // 1. Get all globally unlinked locations
    const allAssignedLocationIds = new Set<string>();
    
    // Check all visuals (top-level mapping)
    // Note: visuals are not directly available here, but node.locations actually passed in as prop are ALL locations.
    // We need to know which ones are already taken by OTHER visuals.
    // Since we don't have all visuals here, we'll assume 'locations' prop has mappedVisualizationCount or similar, 
    // but the most reliable way is if they were filtered before.
    // However, I can't see all visuals here. 
    
    // Let's assume for now that if a location is already in any part of THIS node's structure, it's used.
    // To do better, we'd need the global visuals list.
    
    const unlinkedLocations = locations.filter(l => 
      l.locationType !== 'warehouse' && 
      l.locationType !== 'zone' &&
      (l.mappedVisualizationCount || 0) === 0
    );
    
    const usedInThisStructure = new Set<string>();
    const collectUsed = (s: StructureNode) => {
      if (s.locationId) usedInThisStructure.add(s.locationId);
      s.children?.forEach(collectUsed);
    };
    collectUsed(structure);

    const available = unlinkedLocations.filter(l => !usedInThisStructure.has(l.id));

    let locIdx = 0;
    const processBatch = (sNode: StructureNode): StructureNode => {
      if (sNode.type === 'cell') {
        if (!sNode.locationId && locIdx < available.length) {
          const loc = available[locIdx++];
          return { 
            ...sNode, 
            locationId: loc.id, 
            label: loc.code,
            displayLabel: loc.code.split('-').pop() || loc.code // Use short tail as display label
          };
        }
        return sNode;
      }
      return {
        ...sNode,
        children: sNode.children?.map(processBatch)
      };
    };

    updateStructure(processBatch(structure));
  };

  const findParentById = (root: StructureNode, id: string, parent: StructureNode | null = null): StructureNode | null => {
    if (root.id === id) return parent;
    if (root.children) {
      for (const child of root.children) {
        const found = findParentById(child, id, root);
        if (found) return found;
      }
    }
    return null;
  };

  const findDividerInStructure = (root: StructureNode, dividerId: string): { divider: LayoutSplitDivider, parent: StructureNode } | null => {
    if (root.dividers) {
      const found = root.dividers.find(d => d?.id === dividerId);
      if (found) return { divider: found, parent: root };
    }
    if (root.frame) {
      for (const edge of ['top', 'bottom', 'left', 'right'] as const) {
        if (root.frame[edge as keyof typeof root.frame]?.id === dividerId) {
          return { divider: root.frame[edge as keyof typeof root.frame]!, parent: root };
        }
      }
    }
    if (root.children) {
      for (const child of root.children) {
        const found = findDividerInStructure(child, dividerId);
        if (found) return found;
      }
    }
    return null;
  };

  const updateDivider = (dividerId: string, updates: Partial<LayoutSplitDivider>) => {
    const result = findDividerInStructure(structure, dividerId);
    if (!result) return;
    const { parent } = result;

    const newParent = { ...parent };
    if (newParent.dividers) {
      newParent.dividers = newParent.dividers.map(d => d?.id === dividerId ? { ...d, ...updates } as LayoutSplitDivider : d);
    }
    if (newParent.frame) {
      const newFrame = { ...newParent.frame };
      for (const edge of ['top', 'bottom', 'left', 'right'] as const) {
        if (newFrame[edge as keyof typeof newFrame]?.id === dividerId) {
          newFrame[edge as keyof typeof newFrame] = { ...newFrame[edge as keyof typeof newFrame]!, ...updates };
        }
      }
      newParent.frame = newFrame;
    }

    updateStructure(replaceNodeById(structure, parent.id, newParent));
  };

  const getFullPath = (root: StructureNode, targetId: string, currentPath: string[] = []): string => {
    if (root.id === targetId) return [...currentPath, root.displayLabel || root.label || ''].filter(Boolean).join(' / ');
    if (root.children) {
      for (const child of root.children) {
        const path = getFullPath(child, targetId, [...currentPath, root.displayLabel || root.label || ''].filter(Boolean));
        if (path) return path;
      }
    }
    return '';
  };

  const selectedNode = useMemo(() => 
    selectedCellId ? findNodeById(structure, selectedCellId) : null
  , [selectedCellId, structure]);

  const fullPath = useMemo(() => 
    selectedCellId ? getFullPath(structure, selectedCellId) : ''
  , [selectedCellId, structure]);

  const linkedLocation = useMemo(() => 
    selectedNode?.locationId ? locations.find(l => l.id === selectedNode.locationId) : null
  , [selectedNode, locations]);

  const selectedDivider = useMemo(() => 
    selectedDividerId ? findDividerInStructure(structure, selectedDividerId) : null
  , [selectedDividerId, structure]);

  const generateLabel = (type: StructureNode['splitType'], index: number, config: typeof namingConfig) => {
    const prefix = config.prefix || {
      rows: 'R',
      columns: 'C',
      shelves: 'S',
      bins: 'K',
      drawers: 'D',
      positions: 'P'
    }[type!] || '';
    
    const num = (config.startNumber + index).toString().padStart(config.padding, '0');
    return `${prefix}${num}`;
  };

  const handleSplitConfirm = () => {
    if (!showNamingPanel) return;
    const { id, direction } = showNamingPanel;
    
    const target = findNodeById(structure, id);
    if (!target || target.type !== 'cell') return;

    const newChildren: StructureNode[] = Array.from({ length: namingConfig.count }).map((_, i) => ({
      id: `cell-${Math.random().toString(36).substr(2, 9)}`,
      type: 'cell',
      size: 1 / namingConfig.count,
      displayLabel: generateLabel(namingConfig.type, i, namingConfig),
      label: `${target.label || 'Cell'} ${i + 1}` // Internal descriptive name
    }));

    const newContainer: StructureNode = {
      id: `container-${Math.random().toString(36).substr(2, 9)}`,
      type: 'container',
      split: direction,
      splitType: namingConfig.type,
      size: target.size,
      children: newChildren,
      dividers: Array.from({ length: namingConfig.count - 1 }).map(() => ({
        id: `divider-${Math.random().toString(36).substr(2, 9)}`,
        type: 'solid',
        thickness: 1.8,
        material: 'wood',
        color: '#78350f'
      }))
    };

    updateStructure(replaceNodeById(structure, id, newContainer));
    setSelectedCellId(newChildren[0].id);
    setShowNamingPanel(null);
  };

  const handleSplit = (direction: 'horizontal' | 'vertical', targetId?: string) => {
    const idToSplit = targetId || selectedCellId;
    if (!idToSplit) return;
    
    setNamingConfig(prev => ({
      ...prev,
      type: direction === 'horizontal' ? 'rows' : 'columns',
      count: 2
    }));
    setShowNamingPanel({ id: idToSplit, direction });
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scaleFactor = 1.1;
    const direction = e.deltaY < 0 ? 1 : -1;
    const newZoom = direction > 0 ? zoomLevel * scaleFactor : zoomLevel / scaleFactor;
    setZoomLevel(Math.max(0.1, Math.min(5, newZoom)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: pan.x + e.movementX,
        y: pan.y + e.movementY
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleCompleteSetup = () => {
    const rootId = `root-${node.id}`;
    const newLocations: LogicalLocation[] = [];
    const parentLocId = node.locationId;

    const createLoc = (label: string, code: string, type: string) => {
      const id = `l-${Math.random().toString(36).substr(2, 9)}`;
      newLocations.push({
        id,
        code: code,
        name: `${node.label} - ${label}`,
        parentId: parentLocId,
        locationType: type as any,
        allowsStock: true,
        isReceivable: true,
        isPickable: true,
        isVirtual: false,
        status: 'active'
      });
      return id;
    };

    const createDivider = (type: 'solid' | 'gap') => ({
      id: `divider-${Math.random().toString(36).substr(2, 9)}`,
      type,
      thickness: setupData.dividerThickness,
      material: setupData.dividerMaterial,
      color: setupData.dividerMaterial === 'wood' ? '#78350f' : setupData.dividerMaterial === 'metal' ? '#475569' : setupData.dividerMaterial === 'plastic' ? '#0ea5e9' : undefined,
    });

    let initialStructure: StructureNode = {
      id: rootId,
      type: 'cell',
      size: 1,
      label: node.label,
      displayLabel: 'FRONT'
    };

    // Helper to add frame to root
    const wrapWithFrame = (s: StructureNode): StructureNode => {
      if (!setupData.hasFrame) return s;
      return {
        ...s,
        frame: {
          top: { id: 'frame-t', type: setupData.frameType, thickness: setupData.frameThickness, material: setupData.dividerMaterial },
          bottom: { id: 'frame-b', type: setupData.frameType, thickness: setupData.frameThickness, material: setupData.dividerMaterial },
          left: { id: 'frame-l', type: setupData.frameType, thickness: setupData.frameThickness, material: setupData.dividerMaterial },
          right: { id: 'frame-r', type: setupData.frameType, thickness: setupData.frameThickness, material: setupData.dividerMaterial },
        }
      };
    };

    // Template logic
    if (setupData.template === 'shelves' || setupData.template === 'rows') {
      const count = setupData.rowCount;
      const type = setupData.template === 'shelves' ? 'shelves' : 'rows';
      const locType = setupData.template === 'shelves' ? 'shelf' : 'rack';

      const children: StructureNode[] = Array.from({ length: count }).map((_, i) => {
        const shortCode = `${setupData.template === 'shelves' ? 'S' : 'R'}${i + 1}`;
        const locId = setupData.generateLocations ? createLoc(`${type.slice(0, -1)} ${i + 1}`, `${node.label}-${shortCode}`, locType) : null;
        
        return {
          id: `cell-${Math.random().toString(36).substr(2, 9)}`,
          type: 'cell',
          size: 1 / count,
          displayLabel: shortCode,
          label: `${setupData.template === 'shelves' ? 'Shelf' : 'Row'} ${i + 1}`,
          splitType: type as any,
          locationId: locId
        };
      });

      initialStructure = {
        id: `container-${Math.random().toString(36).substr(2, 9)}`,
        type: 'container',
        split: 'horizontal',
        splitType: type as any,
        size: 1,
        children,
        dividers: Array.from({ length: count - 1 }).map(() => createDivider(setupData.dividerType))
      };
    } else if (setupData.template === 'columns') {
      const count = setupData.colCount;
      const children: StructureNode[] = Array.from({ length: count }).map((_, i) => {
        const shortCode = `C${i + 1}`;
        const locId = setupData.generateLocations ? createLoc(`Column ${i + 1}`, `${node.label}-${shortCode}`, 'rack') : null;

        return {
          id: `cell-${Math.random().toString(36).substr(2, 9)}`,
          type: 'cell',
          size: 1 / count,
          displayLabel: shortCode,
          label: `Column ${i + 1}`,
          splitType: 'columns',
          locationId: locId
        };
      });

      initialStructure = {
        id: `container-${Math.random().toString(36).substr(2, 9)}`,
        type: 'container',
        split: 'vertical',
        splitType: 'columns',
        size: 1,
        children,
        dividers: Array.from({ length: count - 1 }).map(() => createDivider(setupData.dividerType))
      };
    } else if (setupData.template === 'grid') {
      const rows = setupData.rowCount;
      const cols = setupData.colCount;
      
      const rowChildren: StructureNode[] = Array.from({ length: rows }).map((_, rIdx) => {
        const colChildren: StructureNode[] = Array.from({ length: cols }).map((_, cIdx) => {
          const shortCode = `R${rIdx + 1}C${cIdx + 1}`;
          const locId = setupData.generateLocations ? createLoc(`Position R${rIdx + 1} C${cIdx + 1}`, `${node.label}-${shortCode}`, 'bin') : null;

          return {
            id: `cell-${Math.random().toString(36).substr(2, 9)}`,
            type: 'cell',
            size: 1 / cols,
            displayLabel: shortCode,
            label: `Position R${rIdx + 1} C${cIdx + 1}`,
            locationId: locId
          };
        });

        return {
          id: `row-${Math.random().toString(36).substr(2, 9)}`,
          type: 'container',
          split: 'vertical',
          size: 1 / rows,
          children: colChildren,
          dividers: Array.from({ length: cols - 1 }).map(() => createDivider(setupData.dividerType))
        };
      });

      initialStructure = {
        id: `grid-root-${Math.random().toString(36).substr(2, 9)}`,
        type: 'container',
        split: 'horizontal',
        size: 1,
        children: rowChildren,
        dividers: Array.from({ length: rows - 1 }).map(() => createDivider(setupData.dividerType))
      };
    } else if (setupData.template === 'wall_bins') {
      const rows = setupData.rowCount;
      const cols = setupData.colCount;
      const rowChildren: StructureNode[] = Array.from({ length: rows }).map((_, rIdx) => {
        const colChildren: StructureNode[] = Array.from({ length: cols }).map((_, cIdx) => {
          const binNum = (rIdx * cols + cIdx + 1).toString().padStart(2, '0');
          const shortCode = `K${binNum}`;
          const locId = setupData.generateLocations ? createLoc(`Bin ${rIdx * cols + cIdx + 1}`, `${node.label}-${shortCode}`, 'bin') : null;

          return {
            id: `cell-${Math.random().toString(36).substr(2, 9)}`,
            type: 'cell',
            size: 1 / cols,
            displayLabel: shortCode,
            label: `Bin ${rIdx * cols + cIdx + 1}`,
            splitType: 'bins',
            locationId: locId
          };
        });

        return {
          id: `bin-row-${Math.random().toString(36).substr(2, 9)}`,
          type: 'container',
          split: 'vertical',
          size: 1 / rows,
          children: colChildren,
          dividers: Array.from({ length: cols - 1 }).map(() => createDivider(setupData.dividerType))
        };
      });

      initialStructure = {
        id: `wall-bins-root`,
        type: 'container',
        split: 'horizontal',
        size: 1,
        children: rowChildren,
        dividers: Array.from({ length: rows - 1 }).map(() => createDivider(setupData.dividerType))
      };
    }

    initialStructure = wrapWithFrame(initialStructure);

    onUpdateNode(node.id, {
      width: setupData.width,
      height: setupData.height,
      depth: setupData.depth,
      frontSide: setupData.frontSide,
      frontSetupDone: true,
      structure: initialStructure,
      style: {
        ...node.style,
        cornerRadiusTopLeft: setupData.cornerRadiusTopLeft,
        cornerRadiusTopRight: setupData.cornerRadiusTopRight,
        cornerRadiusBottomRight: setupData.cornerRadiusBottomRight,
        cornerRadiusBottomLeft: setupData.cornerRadiusBottomLeft,
        isCornerRadiusLocked: setupData.isCornerRadiusLocked,
      }
    });

    if (newLocations.length > 0 && onAddLocations) {
      onAddLocations(newLocations);
    }
  };

  const handleResize = (containerId: string, layout: Record<string, number>) => {
    const container = findNodeById(structure, containerId);
    if (!container || !container.children) return;

    const newChildren = container.children.map((child) => ({
      ...child,
      size: (layout[child.id] || (child.size * 100)) / 100
    }));

    updateStructure(replaceNodeById(structure, containerId, { ...container, children: newChildren }));
  };

  const AdaptiveLabel = ({ node, isSelected }: { node: StructureNode, isSelected: boolean }) => {
    const cellRef = useRef<HTMLDivElement>(null);
    const [sizeState, setSizeState] = useState<'large' | 'medium' | 'small' | 'tiny'>('large');

    useEffect(() => {
      if (!cellRef.current) return;
      const obs = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        if (width < 30 || height < 30) setSizeState('tiny');
        else if (width < 60 || height < 40) setSizeState('small');
        else if (width < 120 || height < 80) setSizeState('medium');
        else setSizeState('large');
      });
      obs.observe(cellRef.current);
      return () => obs.disconnect();
    }, []);

    const label = node.displayLabel || node.label || '...';
    
    return (
      <div 
        ref={cellRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {sizeState === 'tiny' ? (
            isSelected && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="w-1.5 h-1.5 bg-sky-500 rounded-full" 
              />
            )
          ) : sizeState === 'small' ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`w-2 h-2 rounded-full ${isSelected ? 'bg-sky-500' : 'bg-slate-600'}`} 
            />
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-0.5 text-center px-1"
            >
              <span className={`font-black uppercase tracking-widest whitespace-nowrap leading-none
                ${sizeState === 'medium' ? 'text-[10px]' : 'text-xs'}
                ${isSelected ? 'text-sky-400' : 'text-slate-400'}
              `}>
                {label}
              </span>
              {sizeState === 'large' && node.splitType && (
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                  {node.splitType.slice(0, -1)}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderRecursive = (sNode: StructureNode): React.ReactNode => {
    if (sNode.type === 'cell') {
      const isSelected = selectedCellId === sNode.id;
      const linkedLocation = sNode.locationId ? locations.find(l => l.id === sNode.locationId) : null;

      return (
        <div
          key={sNode.id}
          id={sNode.id}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCellId(sNode.id);
            setSelectedDividerId(null);
            setSelectedFrameEdge(null);
          }}
          className={`relative group flex-1 h-full border transition-all cursor-pointer overflow-hidden
            ${isSelected 
              ? 'bg-sky-500/10 border-sky-500 z-10 shadow-[0_0_15px_rgba(14,165,233,0.1)]' 
              : 'bg-slate-900 border-slate-800/50 hover:border-slate-600 hover:bg-slate-800/50'
            }
          `}
        >
          <AdaptiveLabel node={sNode} isSelected={isSelected} />

          {linkedLocation && (
            <div className="absolute top-1 right-1 pointer-events-none">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            </div>
          )}

          {!isSelected && (
            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40 backdrop-blur-[1px]">
               <button 
                onClick={(e) => { e.stopPropagation(); handleSplit('horizontal', sNode.id); }}
                className="p-1.5 bg-slate-800 hover:bg-sky-500 text-white rounded-md transition-colors"
                title="Split into Rows"
               >
                 <Rows className="w-3.5 h-3.5" />
               </button>
               <button 
                onClick={(e) => { e.stopPropagation(); handleSplit('vertical', sNode.id); }}
                className="p-1.5 bg-slate-800 hover:bg-sky-500 text-white rounded-md transition-colors"
                title="Split into Columns"
               >
                 <Columns className="w-3.5 h-3.5" />
               </button>
            </div>
          )}
        </div>
      );
    }

    const isHorizontal = sNode.split === 'horizontal';

    const content = (
      <ResizablePanelGroup 
        key={`${sNode.id}-${sNode.children?.length}`}
        orientation={isHorizontal ? 'vertical' : 'horizontal'}
        onLayoutChange={(layout) => handleResize(sNode.id, layout)}
        className="flex-1 h-full w-full"
      >
        {sNode.children?.map((child, idx) => {
          const divider = sNode.dividers?.[idx];
          const isLast = idx === sNode.children!.length - 1;

          return (
            <React.Fragment key={child.id}>
              <ResizablePanel 
                id={child.id}
                defaultSize={(child.size || 1) * 100}
                minSize={5}
                className="flex flex-col"
              >
                {renderRecursive(child)}
              </ResizablePanel>
              {!isLast && (
                <ResizableHandle 
                  style={{
                    backgroundColor: divider?.type === 'solid' ? (divider.color || '#475569') : 'transparent',
                    width: !isHorizontal ? `${(divider?.thickness || 1) * totalScale}px` : '100%',
                    height: isHorizontal ? `${(divider?.thickness || 1) * totalScale}px` : '100%',
                    opacity: divider?.opacity ?? 1,
                  }}
                  className={cn(
                    "relative transition-all !bg-opacity-100",
                    divider?.id === selectedDividerId ? "ring-2 ring-sky-500 z-30" : "hover:bg-sky-500/30",
                    divider?.type === 'gap' && "border-slate-800/20 shadow-inner"
                  )}
                  onClick={(e) => {
                    if (divider) {
                      e.stopPropagation();
                      setSelectedDividerId(divider.id);
                      setSelectedCellId(null);
                      setSelectedFrameEdge(null);
                    }
                  }}
                >
                  {divider?.type === 'gap' && (
                    <div className="absolute inset-0 border border-dashed border-slate-700/20 pointer-events-none" />
                  )}
                </ResizableHandle>
              )}
            </React.Fragment>
          );
        })}
      </ResizablePanelGroup>
    );

    // Apply frame if present for this container
    if (sNode.frame) {
      const { top, bottom, left, right } = sNode.frame;
      return (
        <div className="flex-1 h-full w-full flex flex-col bg-slate-900">
           {top && (
             <div 
               onClick={(e) => { e.stopPropagation(); setSelectedDividerId(top.id); setSelectedCellId(null); }}
               className={`shrink-0 transition-all cursor-pointer ${top.id === selectedDividerId ? 'ring-2 ring-sky-500 z-30' : 'hover:bg-sky-500/10'}`}
               style={{ height: `${top.thickness * totalScale}px`, backgroundColor: top.type === 'solid' ? top.color || '#1e293b' : 'transparent' }}
             />
           )}
           <div className="flex-1 flex flex-row min-h-0">
              {left && (
                <div 
                  onClick={(e) => { e.stopPropagation(); setSelectedDividerId(left.id); setSelectedCellId(null); }}
                  className={`shrink-0 transition-all cursor-pointer ${left.id === selectedDividerId ? 'ring-2 ring-sky-500 z-30' : 'hover:bg-sky-500/10'}`}
                  style={{ width: `${left.thickness * totalScale}px`, backgroundColor: left.type === 'solid' ? left.color || '#1e293b' : 'transparent' }}
                />
              )}
              <div className="flex-1 min-w-0 flex flex-col">
                {content}
              </div>
              {right && (
                <div 
                  onClick={(e) => { e.stopPropagation(); setSelectedDividerId(right.id); setSelectedCellId(null); }}
                  className={`shrink-0 transition-all cursor-pointer ${right.id === selectedDividerId ? 'ring-2 ring-sky-500 z-30' : 'hover:bg-sky-500/10'}`}
                  style={{ width: `${right.thickness * totalScale}px`, backgroundColor: right.type === 'solid' ? right.color || '#1e293b' : 'transparent' }}
                />
              )}
           </div>
           {bottom && (
             <div 
               onClick={(e) => { e.stopPropagation(); setSelectedDividerId(bottom.id); setSelectedCellId(null); }}
               className={`shrink-0 transition-all cursor-pointer ${bottom.id === selectedDividerId ? 'ring-2 ring-sky-500 z-30' : 'hover:bg-sky-500/10'}`}
               style={{ height: `${bottom.thickness * totalScale}px`, backgroundColor: bottom.type === 'solid' ? bottom.color || '#1e293b' : 'transparent' }}
             />
           )}
        </div>
      );
    }

    return content;
  };

  const Ruler = ({ orientation }: { orientation: 'horizontal' | 'vertical' }) => {
    if (dimensions.width === 0) return null;
    
    const isHorizontal = orientation === 'horizontal';
    const majorStep = 50; // 50cm
    const minorStep = 10; // 10cm
    const ticks = [];
    
    // Bounds for world coordinates in cm
    const startWorldCm = (0 - (isHorizontal ? pan.x : pan.y)) / totalScale;
    const endWorldCm = ((isHorizontal ? dimensions.width : dimensions.height) - (isHorizontal ? pan.x : pan.y)) / totalScale;
    
    const limit = isHorizontal ? node.width : node.height;
    const startTick = Math.max(0, Math.floor(startWorldCm / minorStep) * minorStep);
    const endTick = Math.min(limit, Math.ceil(endWorldCm / minorStep) * minorStep);

    for (let val = startTick; val <= endTick; val += minorStep) {
      const isMajor = val % majorStep === 0;
      const px = (val * totalScale) + (isHorizontal ? pan.x : pan.y);
      
      ticks.push(
        <div 
          key={val}
          className={`absolute ${isMajor ? 'bg-slate-400' : 'bg-slate-700'}`}
          style={{
            [isHorizontal ? 'left' : 'top']: px,
            [isHorizontal ? 'width' : 'height']: '1px',
            [isHorizontal ? 'height' : 'width']: isMajor ? '100%' : '30%',
            [isHorizontal ? (isHorizontal ? 'bottom' : 'right') : (isHorizontal ? 'bottom' : 'right')]: 0,
          }}
        >
          {isMajor && (
            <span className={`absolute text-[8px] font-bold text-slate-500 whitespace-nowrap ${isHorizontal ? 'left-1 bottom-1' : 'top-1 right-1 rotate-90 origin-top-right'}`}>
              {val / 100}m
            </span>
          )}
        </div>
      );
    }

    return (
      <div 
        className={`absolute bg-[#0f172a]/90 backdrop-blur-sm border-slate-900 ${isHorizontal ? 'left-0 right-0 h-6 border-b' : 'top-0 bottom-0 w-6 border-r'} z-40`}
        style={{
          [isHorizontal ? 'top' : 'left']: 0,
        }}
      >
        {ticks}
      </div>
    );
  };

  if (!node.frontSetupDone) {
    return (
      <FrontSetupWizard 
        node={node} 
        locations={locations} 
        onComplete={handleCompleteSetup}
        wizardStep={wizardStep}
        setWizardStep={setWizardStep}
        setupData={setupData}
        setSetupData={setSetupData}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020617] overflow-hidden relative" id="front-view-root">
      {/* HUD Header */}
      <div className="absolute top-8 left-0 right-0 px-10 z-40 pointer-events-none">
        <div className="max-w-6xl mx-auto flex items-end justify-between pointer-events-auto">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded">
                  <span className="text-[10px] font-black text-sky-400 uppercase tracking-tighter">Front Projection</span>
              </div>
              <h1 className="text-xl font-black text-white uppercase tracking-tight italic">{node.label}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 shadow-2xl">
            <button 
              onClick={() => handleSplit('horizontal')}
              disabled={!selectedCellId}
              className="px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all disabled:opacity-30"
            >
              <Rows className="w-4 h-4" />
              Split Rows
            </button>
            <button 
              onClick={() => handleSplit('vertical')}
              disabled={!selectedCellId}
              className="px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all disabled:opacity-30"
            >
              <Columns className="w-4 h-4" />
              Split Columns
            </button>
            <div className="w-[1px] h-4 bg-white/10 mx-2" />
            <button 
              onClick={handleBatchMap}
              className="px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-400 hover:bg-sky-400/10 rounded-xl transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Batch Map
            </button>
          </div>
        </div>
      </div>

      {/* Editor Main Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => {
          setSelectedCellId(null);
          setSelectedDividerId(null);
        }}
      >
        {/* Naming Options Panel Overlay */}
        <AnimatePresence>
          {showNamingPanel && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
            >
              <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2rem] shadow-2xl max-w-md w-full mx-4">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-sky-500/10 rounded-2xl">
                    <Settings2 className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Split Options</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Define new compartment labels</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Split Type</label>
                    <select 
                      value={namingConfig.type}
                      onChange={(e) => setNamingConfig(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="rows">Rows</option>
                      <option value="columns">Columns</option>
                      <option value="shelves">Shelves</option>
                      <option value="bins">Bins</option>
                      <option value="drawers">Drawers</option>
                      <option value="positions">Positions</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Quantity</label>
                    <input 
                      type="number"
                      min="2"
                      max="20"
                      value={namingConfig.count}
                      onChange={(e) => setNamingConfig(prev => ({ ...prev, count: parseInt(e.target.value) || 2 }))}
                      className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Prefix</label>
                    <input 
                      type="text"
                      placeholder="e.g. R"
                      value={namingConfig.prefix}
                      onChange={(e) => setNamingConfig(prev => ({ ...prev, prefix: e.target.value }))}
                      className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Start At</label>
                    <input 
                      type="number"
                      value={namingConfig.startNumber}
                      onChange={(e) => setNamingConfig(prev => ({ ...prev, startNumber: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Padding</label>
                    <input 
                      type="number"
                      min="0"
                      max="4"
                      value={namingConfig.padding}
                      onChange={(e) => setNamingConfig(prev => ({ ...prev, padding: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-2xl p-4 mb-8 border border-white/5">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3">Preview</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: Math.min(namingConfig.count, 6) }).map((_, i) => (
                      <div key={i} className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-sky-400">
                        {generateLabel(namingConfig.type, i, namingConfig)}
                      </div>
                    ))}
                    {namingConfig.count > 6 && <span className="text-[10px] font-black text-slate-700 self-center">...</span>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowNamingPanel(null)}
                    className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSplitConfirm}
                    className="flex-1 py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_10px_30px_rgba(14,165,233,0.3)]"
                  >
                    Confirm Split
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Rulers that follow the container */}
        <Ruler orientation="horizontal" />
        <Ruler orientation="vertical" />

        {/* The Structure Container */}
        <div 
          className="absolute origin-top-left flex flex-col bg-slate-900 border-2 border-slate-800 shadow-2xl overflow-hidden"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            width: `${node.width * totalScale}px`,
            height: `${node.height * totalScale}px`,
            borderTopLeftRadius: `${(node.style?.cornerRadiusTopLeft || 0) * totalScale}px`,
            borderTopRightRadius: `${(node.style?.cornerRadiusTopRight || 0) * totalScale}px`,
            borderBottomRightRadius: `${(node.style?.cornerRadiusBottomRight || 0) * totalScale}px`,
            borderBottomLeftRadius: `${(node.style?.cornerRadiusBottomLeft || 0) * totalScale}px`,
          }}
        >
          {renderRecursive(structure)}
          
          {/* Grid Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle, #808080 1px, transparent 1px)',
              backgroundSize: `${10 * totalScale}px ${10 * totalScale}px`
            }}
          />
        </div>

        {/* HUD Navigation Info */}
        <div className="absolute bottom-10 right-10 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-2 rounded-2xl z-30">
           <div className="flex items-center gap-2 px-3 border-r border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Zoom</span>
              <span className="text-xs font-black text-sky-400">{Math.round(zoomLevel * 100)}%</span>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={fitToScreen} 
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Fit to Screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* Inspector Overlay */}
      <AnimatePresence>
        {selectedCellId && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-10 left-10 right-10 flex justify-center z-50 pointer-events-none"
          >
             <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 pointer-events-auto max-w-4xl w-full">
                {/* Visual Identification */}
                <div className="flex flex-col gap-1 w-48 shrink-0">
                   <div className="flex items-center gap-2 mb-1">
                      <LayoutGrid className="w-4 h-4 text-sky-400" />
                      <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Active Selector</span>
                   </div>
                   <input 
                     autoFocus
                     type="text"
                     value={selectedNode?.displayLabel || ''}
                     onChange={(e) => updateCell(selectedCellId, { displayLabel: e.target.value.toUpperCase() })}
                     className="bg-slate-800/50 border border-white/5 rounded-xl px-3 py-2 text-white font-black text-lg outline-none w-full focus:ring-1 focus:ring-sky-500"
                     placeholder="Label"
                   />
                </div>

                <div className="h-16 w-px bg-white/5" />

                {/* Path & Context */}
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-2">
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Structural Path</span>
                   </div>
                   <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[11px] font-bold text-slate-300 truncate tracking-tight bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        {fullPath}
                      </span>
                   </div>
                   <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        Type: {selectedNode?.splitType || 'Cell'}
                      </div>
                      {linkedLocation && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                          <Check className="w-3 h-3" />
                          Linked: {linkedLocation.code}
                        </div>
                      )}
                   </div>
                </div>

                <div className="h-16 w-px bg-white/5" />

                {/* Connection Picker */}
                <div className="w-56 shrink-0">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Logical mapping</label>
                   <select 
                     value={selectedNode?.locationId || ''}
                     onChange={(e) => updateCell(selectedCellId, { locationId: e.target.value || null })}
                     className="bg-slate-800 border-none text-[11px] font-black text-slate-300 rounded-xl px-4 py-2.5 outline-none w-full cursor-pointer hover:bg-slate-750 transition-colors"
                   >
                     <option value="">Virtual Node (Only)</option>
                     {locations.filter(l => l.locationType !== 'warehouse' && l.locationType !== 'zone').map(loc => (
                       <option key={loc.id} value={loc.id}>{loc.code} - {loc.name}</option>
                     ))}
                   </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      const deleteNode = (root: StructureNode, targetId: string): StructureNode | null => {
                        if (root.id === targetId) return null;
                        if (!root.children) return root;

                        const filteredChildren = root.children
                          .map(c => deleteNode(c, targetId))
                          .filter((c): c is StructureNode => c !== null);

                        if (filteredChildren.length === 0) {
                           return { ...root, type: 'cell', children: undefined };
                        }
                        
                        // Use structure.id directly since it's in scope
                        if (filteredChildren.length === 1 && targetId !== structure.id) {
                          return filteredChildren[0];
                        }

                        return { ...root, children: filteredChildren };
                      };

                      if (selectedCellId === structure.id) return;
                      
                      const newStructure = deleteNode(structure, selectedCellId);
                      if (newStructure) {
                        updateStructure(newStructure);
                        setSelectedCellId(null);
                      }
                    }}
                    className="p-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl transition-all border border-red-500/10"
                    title="Delete Compartment"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={() => setSelectedCellId(null)}
                    className="p-3.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-2xl transition-all border border-white/5"
                  >
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </button>
                </div>
             </div>
          </motion.div>
        )}

        {selectedDividerId && selectedDivider && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-10 left-10 right-10 flex justify-center z-50 pointer-events-none"
          >
             <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 pointer-events-auto max-w-4xl w-full">
                {/* Visual Identification */}
                <div className="flex flex-col gap-1 w-48 shrink-0">
                   <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-sky-400" />
                      <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Structural Divider</span>
                   </div>
                   <input 
                     type="text"
                     value={selectedDivider.divider.label || ''}
                     onChange={(e) => updateDivider(selectedDividerId, { label: e.target.value })}
                     className="bg-slate-800/50 border border-white/5 rounded-xl px-3 py-2 text-white font-black text-lg outline-none w-full focus:ring-1 focus:ring-sky-500"
                     placeholder="Divider Label"
                   />
                </div>

                <div className="h-16 w-px bg-white/5" />

                {/* Configuration */}
                <div className="flex-1 flex gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Thickness (cm)</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={selectedDivider.divider.thickness}
                        onChange={(e) => updateDivider(selectedDividerId, { thickness: parseFloat(e.target.value) || 0 })}
                        className="w-24 bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-black text-white outline-none focus:ring-1 focus:ring-sky-500"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</label>
                      <div className="flex bg-slate-800 p-1 rounded-xl">
                         {['solid', 'gap', 'frame'].map(type => (
                           <button 
                             key={type}
                             onClick={() => updateDivider(selectedDividerId, { type: type as any })}
                             className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedDivider.divider.type === type ? 'bg-sky-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
                           >
                             {type}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Color</label>
                      <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
                         <div className="relative">
                            <input 
                              type="color"
                              value={selectedDivider.divider.color || '#475569'}
                              onChange={(e) => updateDivider(selectedDividerId, { color: e.target.value })}
                              className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer"
                            />
                         </div>
                         <span className="text-[10px] font-mono font-bold text-slate-400 pr-2">{(selectedDivider.divider.color || '#475569').toUpperCase()}</span>
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Opacity</label>
                      <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedDivider.divider.opacity ?? 1}
                        onChange={(e) => updateDivider(selectedDividerId, { opacity: parseFloat(e.target.value) })}
                        className="w-24 accent-sky-500"
                      />
                   </div>
                </div>

                <div className="h-16 w-px bg-white/5" />

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => {
                        const { parent } = selectedDivider;
                        const newParent = { ...parent };
                        if (newParent.dividers) {
                           newParent.dividers = newParent.dividers.map(d => d?.id === selectedDividerId ? null : d);
                        }
                        if (newParent.frame) {
                           const newFrame = { ...newParent.frame };
                           for (const edge of ['top', 'bottom', 'left', 'right'] as const) {
                              if (newFrame[edge as keyof typeof newFrame]?.id === selectedDividerId) {
                                 delete newFrame[edge as keyof typeof newFrame];
                              }
                           }
                           newParent.frame = newFrame;
                        }
                        updateStructure(replaceNodeById(structure, parent.id, newParent));
                        setSelectedDividerId(null);
                    }}
                    className="p-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl transition-all border border-red-500/10"
                    title="Delete Divider"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={() => setSelectedDividerId(null)}
                    className="p-3.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-2xl transition-all border border-white/5"
                  >
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

