import { 
  Database, 
  Layers, 
  Shapes, 
  ChevronRight, 
  ChevronDown, 
  Box, 
  Eye, 
  EyeOff,
  Search,
  Filter,
  Package,
  Plus,
  Layout as LayoutIcon,
  DoorOpen,
  Square,
  Warehouse,
  Wind
} from 'lucide-react';
import React, { useState } from 'react';
import { LogicalLocation, VisualNode } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarLeftProps {
  locations: LogicalLocation[];
  visuals: VisualNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddPreset: (preset: any) => void;
}

type Tab = 'visuals' | 'presets' | 'locations' | 'layers';

const PRESET_CATEGORIES = [
  {
    name: 'Storage',
    items: [
      { type: 'shelf', label: 'Heavy Duty Rack', icon: Box, w: 2500, d: 1000, h: 4000, color: 'rgba(56, 189, 248, 0.2)', supportsFrontView: true, supportsInteriorView: true },
      { type: 'shelf', label: 'Narrow Aisle Rack', icon: Box, w: 2500, d: 800, h: 6000, color: 'rgba(56, 189, 248, 0.2)', supportsFrontView: true, supportsInteriorView: true },
      { type: 'cabinet', label: 'Meta Cabinet', icon: Package, w: 1000, d: 500, h: 2000, color: 'rgba(129, 140, 248, 0.2)', supportsFrontView: true, supportsInteriorView: true },
      { type: 'shelf', label: 'Gravity Flow Rack', icon: Box, w: 1500, d: 1500, h: 2000, color: 'rgba(34, 197, 94, 0.2)', supportsFrontView: true, supportsInteriorView: true },
    ]
  },
  {
    name: 'Operational',
    items: [
      { type: 'zone', label: 'Packing Station', icon: Square, w: 2000, d: 1500, h: 0, color: 'rgba(234, 179, 8, 0.1)', supportsFrontView: false, supportsInteriorView: false },
      { type: 'zone', label: 'Quality Control', icon: Square, w: 3000, d: 2000, h: 0, color: 'rgba(168, 85, 247, 0.1)', supportsFrontView: false, supportsInteriorView: false },
      { type: 'zone', label: 'Staging Area', icon: Square, w: 5000, d: 5000, h: 0, color: 'rgba(14, 165, 233, 0.05)', supportsFrontView: false, supportsInteriorView: false },
    ]
  },
  {
    name: 'Infrastructure',
    items: [
      { type: 'zone', label: 'Door / Access', icon: DoorOpen, w: 1200, d: 200, h: 2100, color: 'rgba(244, 63, 94, 0.4)', supportsFrontView: false, supportsInteriorView: false },
      { type: 'zone', label: 'Window', icon: Wind, w: 1500, d: 100, h: 4000, color: 'rgba(56, 189, 248, 0.3)', supportsFrontView: false, supportsInteriorView: false },
      { type: 'zone', label: 'Support Pillar', icon: Square, w: 600, d: 600, h: 10000, color: 'rgba(71, 85, 105, 0.8)', supportsFrontView: false, supportsInteriorView: false },
    ]
  }
];

export default function EditorSidebarLeft({ locations, visuals, selectedId, onSelect, onAddPreset }: SidebarLeftProps) {
  const [activeTab, setActiveTab] = useState<Tab>('visuals');
  const [expandedIds, setExpandedIds] = useState<string[]>(['l1']);

  const rootVisual = visuals.find(v => v.parentId === null && v.type === 'zone');
  const otherVisuals = visuals.filter(v => v !== rootVisual);

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col z-30">
      <div className="flex bg-slate-950/50 border-b border-slate-700">
        <TabBtn icon={<Shapes />} active={activeTab === 'visuals'} onClick={() => setActiveTab('visuals')} title="Visuals List" />
        <TabBtn icon={<Package />} active={activeTab === 'presets'} onClick={() => setActiveTab('presets')} title="Object Presets" />
        <TabBtn icon={<Database />} active={activeTab === 'locations'} onClick={() => setActiveTab('locations')} title="Connected Locations" />
        <TabBtn icon={<Layers />} active={activeTab === 'layers'} onClick={() => setActiveTab('layers')} title="Layers" />
      </div>

      <div className="p-3 border-b border-slate-700 bg-slate-900">
         <div className="relative group">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500 transition-colors group-focus-within:text-sky-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold uppercase tracking-widest text-white placeholder-slate-700 focus:ring-1 focus:ring-sky-500 transition-all outline-none"
            />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 p-2">
        {activeTab === 'visuals' && (
          <div className="space-y-4">
             {rootVisual && (
               <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2 mb-2 italic">Physical Footprint</p>
                  <div 
                    onClick={() => onSelect(rootVisual.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedId === rootVisual.id ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 text-slate-400'
                    }`}
                  >
                     <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-700 shrink-0">
                        <Warehouse className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-tight text-white">{rootVisual.label}</p>
                        <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                          {rootVisual.width/10}cm x {rootVisual.depth/10}cm Total
                        </p>
                     </div>
                  </div>
               </div>
             )}

             <div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2 mb-2 italic">Visual Nodes ({otherVisuals.length})</p>
                {otherVisuals.map(visual => (
                  <VisualListItem 
                    key={visual.id} 
                    visual={visual} 
                    selected={selectedId === visual.id} 
                    onSelect={() => onSelect(visual.id)} 
                  />
                ))}
                {otherVisuals.length === 0 && (
                  <div className="p-8 text-center text-slate-700 text-[10px] uppercase font-bold italic tracking-widest opacity-40">
                    No child objects placed yet
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="space-y-6">
             {PRESET_CATEGORIES.map(cat => (
               <div key={cat.name}>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2 mb-3 italic">{cat.name}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {cat.items.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => onAddPreset(item)}
                        className="group p-3 rounded-xl bg-slate-800/40 border border-slate-700 hover:border-sky-500/50 hover:bg-slate-800 transition-all cursor-grab active:cursor-grabbing flex items-center gap-3"
                      >
                         <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-750 text-slate-500 group-hover:text-sky-400 transition-colors">
                            <item.icon className="w-5 h-5" />
                         </div>
                         <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-tight text-slate-200 group-hover:text-white">{item.label}</p>
                            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                              {item.w/10}x{item.d/10}cm Surface
                            </p>
                         </div>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 rounded-md bg-sky-500 text-slate-900 flex items-center justify-center">
                               <Plus className="w-3.5 h-3.5" />
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-1">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2 mb-2 italic">Hierarchy</p>
             {locations.filter(l => l.parentId === null).map(loc => (
               <LocationTreeItem 
                 key={loc.id} 
                 location={loc} 
                 allLocations={locations} 
                 visuals={visuals}
                 expandedIds={expandedIds}
                 setExpandedIds={setExpandedIds}
                 selectedId={selectedId}
                 onSelect={onSelect}
                 depth={0}
               />
             ))}
          </div>
        )}

        {activeTab === 'layers' && (
           <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-30">
             <Layers className="w-10 h-10 text-slate-600" />
             <p className="text-[10px] font-black uppercase tracking-widest italic">Layer stack coming soon</p>
           </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-700 bg-slate-900 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Active filter: none</span>
         </div>
      </div>
    </div>
  );
}

function TabBtn({ icon, active, onClick, badge, title }: { icon: React.ReactElement, active: boolean, onClick: () => void, badge?: number, title?: string }) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={`
        flex-1 flex items-center justify-center p-4 transition-all relative
        ${active ? 'text-sky-400 bg-slate-800 shadow-[inset_0_-2px_0_0_#38bdf8]' : 'text-slate-600 hover:text-slate-400'}
      `}
    >
      {React.cloneElement(icon, { className: 'w-4 h-4' } as any)}
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-2 right-3 w-3.5 h-3.5 bg-sky-500 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950 border border-slate-900 shadow-[0_0_8px_rgba(56,189,248,0.3)]">
           {badge}
        </span>
      )}
    </button>
  );
}

function LocationTreeItem({ location, allLocations, visuals, expandedIds, setExpandedIds, selectedId, onSelect, depth }: any) {
  const children = allLocations.filter((l: any) => l.parentId === location.id);
  const isExpanded = expandedIds.includes(location.id);
  const isSelected = selectedId === location.id;
  const isMapped = visuals.some((v: any) => v.locationId === location.id);
  const hasChildren = children.length > 0;

  const toggle = (e: any) => {
    e.stopPropagation();
    setExpandedIds((prev: any) => 
      prev.includes(location.id) ? prev.filter((i: any) => i !== location.id) : [...prev, location.id]
    );
  };

  return (
    <div className="select-none">
      <div 
        className={`
          flex items-center gap-2 p-1 py-1.5 rounded-md cursor-pointer group transition-all mb-0.5
          ${isSelected ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'hover:bg-slate-800 text-slate-500 hover:text-slate-200'}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelect(location.id)}
      >
        <div onClick={toggle} className={`hover:text-white transition-colors ${!hasChildren && 'opacity-0 pointer-events-none'}`}>
           {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
        <Box className={`w-3.5 h-3.5 ${isMapped ? 'text-sky-500/40' : isSelected ? 'text-sky-400' : 'text-slate-700'}`} />
        <span className="text-[10px] font-bold flex-1 truncate uppercase tracking-tight">{location.code}</span>
        {isMapped && <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]"></div>}
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children.map((child: any) => (
               <LocationTreeItem 
                 key={child.id} 
                 location={child} 
                 allLocations={allLocations} 
                 visuals={visuals}
                 expandedIds={expandedIds}
                 setExpandedIds={setExpandedIds}
                 selectedId={selectedId}
                 onSelect={onSelect}
                 depth={depth + 1}
               />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VisualListItem({ visual, selected, onSelect }: any) {
  return (
    <div 
      className={`
        flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border mb-1
        ${selected ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'hover:bg-slate-800 text-slate-500 border-transparent hover:text-slate-200'}
      `}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
         <div className={`w-4 h-4 border rounded flex items-center justify-center p-0.5 ${selected ? 'border-sky-500' : 'border-slate-700'}`}>
            <div className={`w-full h-full rounded-sm ${selected ? 'bg-sky-500' : 'bg-slate-700'}`}></div>
         </div>
         <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-tight">{visual.label}</span>
            <span className="text-[8px] text-slate-600 font-mono italic">{visual.locationId ? 'Mapped-ID' : 'Virtual'}</span>
         </div>
      </div>
      <button className={`p-1 transition-colors ${selected ? 'text-sky-400' : 'hover:text-white'}`}>
        <Eye className="w-3 h-3" />
      </button>
    </div>
  );
}
