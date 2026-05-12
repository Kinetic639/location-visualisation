import { 
  VisualNode, 
  LogicalLocation, 
  Layout,
  ViewMode
} from '../../types';
import { 
  Info, 
  Maximize2, 
  Move, 
  Palette, 
  Link as LinkIcon, 
  Link2Off, 
  Trash2, 
  Archive, 
  Box, 
  QrCode, 
  ChevronRight,
  Package,
  History,
  AlertTriangle,
  Settings2,
  Database,
  Search,
  Plus,
  Map as MapIcon,
  Eye,
  Unlink,
  Layers,
  Grid3X3
} from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarRightProps {
  layout: Layout;
  selectedNode: VisualNode | null;
  selectedLocation: LogicalLocation | null;
  locations: LogicalLocation[];
  visuals: VisualNode[];
  viewMode: ViewMode;
  onUnlink: (nodeId: string) => void;
  onRemoveVisual: (nodeId: string) => void;
  onAssignLocation: (locationId: string) => void;
  onUpdateNode: (id: string, updates: Partial<VisualNode>) => void;
  onCreateLocationFromVisual: () => void;
  onSetViewMode: (mode: ViewMode) => void;
}

export default function EditorSidebarRight({ 
  layout,
  selectedNode, 
  selectedLocation, 
  locations,
  visuals,
  viewMode,
  onUnlink,
  onRemoveVisual,
  onAssignLocation,
  onUpdateNode,
  onCreateLocationFromVisual,
  onSetViewMode
}: SidebarRightProps) {
  
  const [isLinking, setIsLinking] = useState(false);

  if (!selectedNode && !selectedLocation) {
    const rootVisual = visuals.find(v => v.parentId === null && v.type === 'zone');
    
    return (
      <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full overflow-hidden z-30">
        <div className="flex border-b border-slate-700 bg-slate-950/50">
           <div className="p-4 flex-1 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Summary</h3>
              <Settings2 className="w-3.5 h-3.5 text-slate-700" />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
           {/* Blueprint Info */}
           <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 shadow-lg shadow-sky-500/10">
                 <MapIcon className="w-8 h-8" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Active Project</p>
                 <h2 className="text-xl font-bold text-white tracking-tight uppercase">{layout.name}</h2>
                 <p className="text-[10px] text-slate-600 font-bold mt-1 uppercase">Root: {rootVisual?.label || 'Spatial Environment'}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Spatial Bounds</p>
                    <div className="flex items-center justify-between">
                       <p className="text-xs font-bold text-slate-300">Dimensions</p>
                       <p className="text-xs font-mono font-bold text-sky-400">{rootVisual ? `${rootVisual.width / 10}cm x ${rootVisual.depth / 10}cm` : 'N/A'}</p>
                    </div>
                 </div>

                 <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Project Statistics</p>
                    <div className="space-y-3">
                       <StatRow label="Visual Nodes" value={visuals.length.toString()} />
                       <StatRow label="Mapped" value={visuals.filter(v => v.locationId).length.toString()} />
                       <StatRow label="Logical Root" value={rootVisual?.locationId ? 'Linked' : 'Spatial-First'} />
                    </div>
                 </div>
              </div>

              <div className="space-y-2 pt-4">
                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Quick actions</p>
                 <button className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-300 text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between group">
                    View Entire Plan
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                 </button>
                 <button className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-300 text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between group">
                    Export Metadata
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Linked state
  const isLinked = selectedNode && selectedNode.locationId !== null;
  // Visual only state
  const isVisualOnly = selectedNode && selectedNode.locationId === null;
  // Location only state (selected from tree but not placed)
  const isLocationOnly = !selectedNode && selectedLocation;

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full overflow-hidden z-30">
      <div className="flex border-b border-slate-700 bg-slate-950/50">
         <div className="p-4 flex-1 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Inspector</h3>
            <Settings2 className="w-3.5 h-3.5 text-slate-700" />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 p-4 space-y-8">
        
        {/* State Badges */}
        <div className="flex flex-wrap gap-2">
            {isLinked && <Badge color="sky" label="Linked-State" icon={<LinkIcon className="w-3 h-3" />} />}
            {isVisualOnly && <Badge color="amber" label="Virtual Node" icon={<AlertTriangle className="w-3 h-3" />} />}
            {isLocationOnly && <Badge color="slate" label="Logical Unit" icon={<Database className="w-3 h-3" />} />}
            {selectedLocation?.status === 'archived' && <Badge color="red" label="Archived" icon={<Archive className="w-3 h-3" />} />}
        </div>

        {/* Visual Properties Section */}
        {selectedNode && (
          <section className="space-y-4">
             <SectionHeader icon={<Maximize2 />} label="Geometry" />
             <div className="grid grid-cols-2 gap-3">
                {viewMode === ViewMode.TOP_DOWN ? (
                  <>
                    <EditablePropBox 
                      label="Pos-X" 
                      value={selectedNode.x} 
                      unit="cm"
                      onChange={(val) => onUpdateNode(selectedNode.id, { x: val })} 
                    />
                    <EditablePropBox 
                      label="Pos-Y" 
                      value={selectedNode.y} 
                      unit="cm"
                      onChange={(val) => onUpdateNode(selectedNode.id, { y: val })} 
                    />
                    <EditablePropBox 
                      label="Width" 
                      value={selectedNode.width} 
                      unit="cm"
                      onChange={(val) => onUpdateNode(selectedNode.id, { width: val })} 
                    />
                    <EditablePropBox 
                      label="Depth" 
                      value={selectedNode.depth} 
                      unit="cm"
                      onChange={(val) => onUpdateNode(selectedNode.id, { depth: val })} 
                    />
                  </>
                ) : (
                  <>
                    <EditablePropBox 
                      label="Width" 
                      value={selectedNode.width} 
                      unit="cm"
                      onChange={(val) => onUpdateNode(selectedNode.id, { width: val })} 
                    />
                    <EditablePropBox 
                      label="Height" 
                      value={selectedNode.height} 
                      unit="cm"
                      onChange={(val) => onUpdateNode(selectedNode.id, { height: val })} 
                    />
                    <EditablePropBox 
                      label="Elev-Z" 
                      value={selectedNode.z} 
                      unit="cm"
                      onChange={(val) => onUpdateNode(selectedNode.id, { z: val })} 
                    />
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-750 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Z-Axis Focus</span>
                    </div>
                  </>
                )}
                <div className="col-span-2">
                   <EditablePropBox 
                     label="Orientation" 
                     value={selectedNode.rotation} 
                     unit="°"
                     onChange={(val) => onUpdateNode(selectedNode.id, { rotation: val })} 
                   />
                </div>
             </div>
             
             <div className="pt-2">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 italic">Material skin</p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-750">
                   <div 
                     className="w-10 h-10 rounded-lg border border-white/10 shadow-inner" 
                     style={{ backgroundColor: selectedNode.color }}
                   ></div>
                   <div className="flex-1">
                      <p className="text-[10px] font-bold text-white uppercase tracking-tight">Main Surface</p>
                      <p className="text-[9px] text-slate-600 font-mono italic">HEX: {selectedNode.color}</p>
                   </div>
                   <Palette className="w-4 h-4 text-slate-700" />
                </div>
             </div>

             {viewMode === ViewMode.FRONT && selectedNode.frontSetupDone && (
               <div className="pt-4 border-t border-slate-800 space-y-4">
                 <SectionHeader icon={<Palette />} label="Front Shape & Corners" />
                 
                 <div className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-750 rounded-xl">
                   <div className="flex items-center gap-2">
                     {selectedNode.style?.isCornerRadiusLocked ? <LinkIcon className="w-3.5 h-3.5 text-sky-400" /> : <Unlink className="w-3.5 h-3.5 text-slate-500" />}
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lock Corners</span>
                   </div>
                   <button 
                     onClick={() => onUpdateNode(selectedNode.id, { 
                       style: { 
                         ...selectedNode.style, 
                         isCornerRadiusLocked: !(selectedNode.style?.isCornerRadiusLocked ?? true) 
                       } 
                     })}
                     className={`w-8 h-4 rounded-full transition-all relative ${selectedNode.style?.isCornerRadiusLocked ? 'bg-sky-500' : 'bg-slate-700'}`}
                   >
                     <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${selectedNode.style?.isCornerRadiusLocked ? 'left-4' : 'left-0.5'}`} />
                   </button>
                 </div>

                 {selectedNode.style?.isCornerRadiusLocked ? (
                   <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                         <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Global Radius</label>
                         <span className="text-[10px] font-black text-sky-400">{selectedNode.style?.cornerRadiusTopLeft || 0}px</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="1"
                        value={selectedNode.style?.cornerRadiusTopLeft || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          onUpdateNode(selectedNode.id, {
                            style: {
                              ...selectedNode.style,
                              cornerRadiusTopLeft: val,
                              cornerRadiusTopRight: val,
                              cornerRadiusBottomRight: val,
                              cornerRadiusBottomLeft: val,
                            }
                          });
                        }}
                        className="w-full accent-sky-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'cornerRadiusTopLeft', label: 'TL' },
                        { id: 'cornerRadiusTopRight', label: 'TR' },
                        { id: 'cornerRadiusBottomLeft', label: 'BL' },
                        { id: 'cornerRadiusBottomRight', label: 'BR' },
                      ].map(corner => (
                        <div key={corner.id} className="p-2 bg-slate-800/40 border border-slate-750 rounded-xl">
                           <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">{corner.label}</label>
                           <input 
                             type="number"
                             value={(selectedNode.style as any)?.[corner.id] || 0}
                             onChange={(e) => onUpdateNode(selectedNode.id, {
                               style: {
                                 ...selectedNode.style,
                                 [corner.id]: parseInt(e.target.value) || 0
                               }
                             })}
                             className="w-full bg-transparent border-none p-0 text-[10px] font-bold text-slate-300 font-mono outline-none"
                           />
                        </div>
                      ))}
                   </div>
                 )}

                 <div className="grid grid-cols-3 gap-1">
                   {[
                     { label: 'Sharp', values: [0, 0, 0, 0] },
                     { label: 'Slight', values: [4, 4, 4, 4] },
                     { label: 'Round', values: [12, 12, 12, 12] },
                     { label: 'Modern', values: [8, 8, 8, 8] },
                     { label: 'Bin', values: [24, 24, 24, 24] },
                     { label: 'Soft', values: [4, 4, 16, 16] },
                   ].map(preset => (
                     <button 
                       key={preset.label}
                       onClick={() => onUpdateNode(selectedNode.id, {
                         style: {
                           ...selectedNode.style,
                           cornerRadiusTopLeft: preset.values[0],
                           cornerRadiusTopRight: preset.values[1],
                           cornerRadiusBottomRight: preset.values[2],
                           cornerRadiusBottomLeft: preset.values[3],
                         }
                       })}
                       className="py-1 px-2 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-750 rounded-lg text-[8px] font-black text-slate-500 hover:text-white transition-all uppercase"
                     >
                       {preset.label}
                     </button>
                   ))}
                 </div>

                 <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden group/prev">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #808080 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                    <div 
                       className="bg-sky-500/10 border border-sky-500/40 w-16 h-20 transition-all duration-300"
                       style={{
                         borderTopLeftRadius: `${(selectedNode.style?.cornerRadiusTopLeft || 0) / 4}px`,
                         borderTopRightRadius: `${(selectedNode.style?.cornerRadiusTopRight || 0) / 4}px`,
                         borderBottomRightRadius: `${(selectedNode.style?.cornerRadiusBottomRight || 0) / 4}px`,
                         borderBottomLeftRadius: `${(selectedNode.style?.cornerRadiusBottomLeft || 0) / 4}px`,
                       }}
                    ></div>
                    <span className="absolute bottom-2 right-2 text-[7px] font-black text-slate-700 uppercase tracking-widest opacity-0 group-hover/prev:opacity-100 transition-opacity">Mini-Preview</span>
                 </div>
               </div>
             )}
          </section>
        )}

        {/* Location Properties Section */}
        {(selectedLocation || isLinked) && (
          <section className="space-y-4">
             <SectionHeader icon={<Info />} label="Logical mapping" />
             <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750 space-y-4 relative group">
                <div className="absolute top-4 right-4 text-emerald-500/30 group-hover:text-emerald-500 transition-colors">
                   <LinkIcon className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-3">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${isLinked ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' : 'bg-slate-700/50 border-slate-600 text-slate-500'}`}>
                      <Box className="w-6 h-6" />
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-black text-white uppercase tracking-tight truncate">{selectedLocation?.code || "NULL-POINTER"}</p>
                      <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest italic">{selectedLocation?.locationType}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-750 pt-4">
                    <Detail label="Volumetric" value={selectedLocation?.allowsStock ? "Allowed" : "Restricted"} />
                    <Detail label="SKU Density" value={selectedLocation?.skuCount?.toString() || "0"} />
                    <Detail label="Stock Level" value={selectedLocation?.stockCount?.toString() || "0 UNIT"} />
                    <Detail label="Parent Node" value={locations.find(l => l.id === selectedLocation?.parentId)?.code || "ROOT-SYS"} />
                </div>

                <div className="flex gap-2 pt-2">
                   <ActionButton icon={<QrCode className="w-3.5 h-3.5" />} label="Identity" />
                   <ActionButton icon={<History className="w-3.5 h-3.5" />} label="History" />
                   <ActionButton icon={<Package className="w-3.5 h-3.5" />} label="SKUs" />
                </div>
             </div>
          </section>
        )}

        {/* Contextual Views Section */}
        {selectedNode && (selectedNode.supportsFrontView || selectedNode.supportsInteriorView) && (
          <section className="space-y-3">
             <SectionHeader icon={<Eye />} label="Contextual Editing" />
             {!selectedNode.frontSetupDone && selectedNode.supportsFrontView && (
               <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10 mb-2">
                 <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest mb-1 italic">Setup Required</p>
                 <p className="text-[10px] text-slate-500 font-medium">This object has no front view projection yet. Height and orientation must be defined.</p>
               </div>
             )}
             <div className="grid grid-cols-1 gap-2">
                {selectedNode.supportsFrontView && (
                   <PrimaryBtn 
                     icon={selectedNode.frontSetupDone ? <Maximize2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                     label={selectedNode.frontSetupDone ? "Edit Front View" : "Set up front view"} 
                     onClick={() => onSetViewMode(ViewMode.FRONT)} 
                     variant={selectedNode.frontSetupDone ? "outline" : "solid"}
                   />
                )}
                {selectedNode.supportsInteriorView && (
                   <PrimaryBtn 
                     icon={<Package className="w-4 h-4" />} 
                     label="Edit Interior" 
                     onClick={() => onSetViewMode(ViewMode.INTERIOR)} 
                     variant="outline"
                   />
                )}
             </div>
          </section>
        )}

        {/* Action Logic Buttons */}
        <section className="pt-6 border-t border-slate-800 space-y-3">
          {isLinked && (
            <>
               <SecondaryBtn 
                 icon={<Link2Off className="w-4 h-4" />} 
                 label="Sever link" 
                 onClick={() => onUnlink(selectedNode.id)}
               />
               <SecondaryBtn 
                 icon={<Trash2 className="w-4 h-4" />} 
                 label="Purge visual" 
                 color="text-rose-500/60"
                 onClick={() => onRemoveVisual(selectedNode.id)}
               />
            </>
          )}

          {isVisualOnly && (
            <>
               <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-4">
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1 italic">Void state</p>
                  <p className="text-[10px] text-slate-500 font-medium">This node has no logical anchor. It is a visual wrapper only.</p>
               </div>
               <PrimaryBtn 
                 icon={<LinkIcon className="w-4 h-4" />} 
                 label="Bind existing" 
                 onClick={() => setIsLinking(true)} 
               />
               <PrimaryBtn 
                 icon={<Plus className="w-4 h-4" />} 
                 label="Synthesize logic" 
                 onClick={onCreateLocationFromVisual}
                 variant="outline"
               />
               <SecondaryBtn 
                 icon={<Trash2 className="w-4 h-4" />} 
                 label="Purge visual" 
                 color="text-rose-500/60"
                 onClick={() => onRemoveVisual(selectedNode.id)}
               />
            </>
          )}

          {isLocationOnly && (
             <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-2xl border-2 border-dashed border-slate-800">
               <Move className="w-8 h-8 text-slate-700" />
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Logical ref selected. Drop into plan to visualize.</p>
             </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {isLinking && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 bg-slate-900/98 backdrop-blur-md z-50 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-white text-[10px] uppercase tracking-widest">Select anchor</h3>
              <button onClick={() => setIsLinking(false)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {locations.filter(l => !visuals.some(v => v.locationId === l.id)).map(loc => (
                <div 
                  key={loc.id}
                  onClick={() => {
                    if (selectedNode) {
                      onAssignLocation(loc.id);
                      setIsLinking(false);
                    }
                  }}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-750 hover:bg-sky-500/10 hover:border-sky-500/40 transition-all cursor-pointer group"
                >
                  <p className="text-[11px] font-black text-white group-hover:text-sky-400 uppercase tracking-tight transition-colors">{loc.code}</p>
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">{loc.name}</p>
                </div>
              ))}
              {locations.filter(l => !visuals.some(v => v.locationId === l.id)).length === 0 && (
                <div className="p-12 text-center opacity-30">
                  <Search className="w-8 h-8 text-slate-600 mx-auto mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest italic">No unmapped locations</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
       {React.cloneElement(icon as React.ReactElement, { className: 'w-3.5 h-3.5' } as any)}
       <span>{label}</span>
    </div>
  );
}

function StatRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
       <span className="text-[10px] font-mono font-bold text-slate-300">{value}</span>
    </div>
  );
}

function EditablePropBox({ label, value, unit, onChange }: { label: string, value: number, unit: string, onChange: (val: number) => void }) {
  // Convert mm internal to cm UI if unit is cm
  const displayValue = unit === 'cm' ? value / 10 : value;
  
  return (
    <div className="p-3 bg-slate-800/40 border border-slate-750 rounded-xl relative group focus-within:border-sky-500/50 transition-all">
      <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest absolute top-2 right-3 italic group-hover:text-sky-500/40 transition-colors">{unit}</span>
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">{label}</p>
      <input 
        type="number"
        value={displayValue}
        onChange={(e) => {
          const val = Number(e.target.value);
          onChange(unit === 'cm' ? Math.round(val) * 10 : val);
        }}
        className="w-full bg-transparent border-none p-0 text-[11px] font-bold text-slate-300 font-mono tracking-tighter outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}

function PropBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-3 bg-slate-800/40 border border-slate-750 rounded-xl relative group">
      <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest absolute top-2 right-3 italic group-hover:text-sky-500/40 transition-colors">Val</span>
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">{label}</p>
      <p className="text-[11px] font-bold text-slate-300 font-mono tracking-tighter">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string, value: string }) {
  return (
    <div>
       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">{label}</p>
       <p className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">{value}</p>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/40 border border-slate-750 hover:bg-slate-700 transition-all group">
       <div className="text-slate-600 group-hover:text-sky-400 transition-colors">
          {icon}
       </div>
       <span className="text-[8px] font-black text-slate-600 group-hover:text-slate-400 transition-colors uppercase tracking-widest">{label}</span>
    </button>
  );
}

function PrimaryBtn({ icon, label, onClick, variant = 'solid' }: { icon: React.ReactNode, label: string, onClick: () => void, variant?: 'solid' | 'outline' }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
        ${variant === 'solid' 
          ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/10 hover:bg-sky-400' 
          : 'bg-transparent border border-sky-500/30 text-sky-400 hover:bg-sky-500/5'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function SecondaryBtn({ icon, label, onClick, color = 'text-slate-500' }: { icon: React.ReactNode, label: string, onClick?: () => void, color?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-750 ${color}`}
    >
      <div className="opacity-40 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest transition-colors">{label}</span>
    </button>
  );
}

function Badge({ color, label, icon }: { color: 'sky' | 'amber' | 'red' | 'slate', label: string, icon: React.ReactNode }) {
  const styles = {
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_8px_rgba(56,189,248,0.1)]',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]',
    red: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]',
    slate: 'bg-slate-800/50 text-slate-500 border-slate-700'
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${styles[color]}`}>
       {icon}
       {label}
    </div>
  );
}
