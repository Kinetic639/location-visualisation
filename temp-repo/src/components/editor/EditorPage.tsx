import React, { useState, useMemo } from 'react';
import { 
  Box,
  Package
} from 'lucide-react';
import { 
  Layout, 
  VisualNode, 
  LogicalLocation, 
  ViewMode, 
  LocationType 
} from '../../types';
import EditorToolbar from './EditorToolbar';
import EditorSidebarLeft from './EditorSidebarLeft';
import EditorSidebarRight from './EditorSidebarRight';
import EditorCanvas from './EditorCanvas';
import FrontViewEditor from './FrontViewEditor';
import AddObjectModal from './AddObjectModal';
import { motion, AnimatePresence } from 'motion/react';

interface EditorPageProps {
  layout: Layout;
  locations: LogicalLocation[];
  visuals: VisualNode[];
  setVisuals: React.Dispatch<React.SetStateAction<VisualNode[]>>;
  setLocations: React.Dispatch<React.SetStateAction<LogicalLocation[]>>;
  onBack: () => void;
}

export type EditorTool = 'select' | 'pan' | 'add' | 'measure' | 'split';

export default function EditorPage({ 
  layout, 
  locations, 
  visuals, 
  setVisuals, 
  setLocations,
  onBack 
}: EditorPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TOP_DOWN);
  const [selectedTool, setSelectedTool] = useState<EditorTool>('select');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(100);
  const [showRulers, setShowRulers] = useState(true);
  const [fitTrigger, setFitTrigger] = useState(0);

  // Derived state
  const layoutVisuals = useMemo(() => 
    visuals.filter(v => v.layoutId === layout.id)
  , [visuals, layout.id]);

  const rootVisual = useMemo(() => 
    layoutVisuals.find(v => v.parentId === null) || null
  , [layoutVisuals]);

  const handleFitScreen = () => {
    setFitTrigger(prev => prev + 1);
  };

  const selectedNode = useMemo(() => 
    layoutVisuals.find(v => v.id === selectedNodeId) || null
  , [layoutVisuals, selectedNodeId]);

  const selectedLocation = useMemo(() => {
    // If a node is selected, try to find its linked location
    if (selectedNode?.locationId) {
      return locations.find(l => l.id === selectedNode.locationId) || null;
    }
    // Otherwise, maybe we selected a location directly from the tree
    if (selectedNodeId && layoutVisuals.every(v => v.id !== selectedNodeId)) {
        return locations.find(l => l.id === selectedNodeId) || null;
    }
    return null;
  }, [selectedNode, selectedNodeId, locations, layoutVisuals]);

  const handleUnlink = (nodeId: string) => {
    setVisuals(prev => prev.map(v => v.id === nodeId ? { ...v, locationId: null } : v));
  };

  const handleRemoveVisual = (nodeId: string) => {
    setVisuals(prev => prev.filter(v => v.id !== nodeId));
    setSelectedNodeId(null);
  };

  const handleAddObject = (data: any) => {
    // Logic for adding visual, location, or both
    const newId = `new-${Date.now()}`;
    const rootVisual = layoutVisuals.find(v => v.parentId === null);
    
    if (data.type === 'visual' || data.type === 'both') {
        const newVisual: VisualNode = {
            id: `v-${newId}`,
            layoutId: layout.id,
            locationId: data.type === 'both' ? `l-${newId}` : null,
            type: 'rectangle',
            label: data.label || 'New Object',
            x: rootVisual ? rootVisual.width / 10 : 500,
            y: rootVisual ? rootVisual.depth / 10 : 300,
            z: 0,
            rotation: 0,
            width: 1000,
            height: 2000,
            depth: 1000,
            color: '#cbd5e1',
            viewMode: viewMode,
            parentId: rootVisual?.id || null
        };
        setVisuals(prev => [...prev, newVisual]);
        setSelectedNodeId(newVisual.id);
    }

    if (data.type === 'location' || data.type === 'both') {
        const newLoc: LogicalLocation = {
            id: `l-${newId}`,
            code: data.code || `NEW-${newId.slice(-4)}`,
            name: data.name || data.label || 'New Location',
            parentId: null,
            locationType: data.locationType || LocationType.RACK,
            allowsStock: true,
            isReceivable: true,
            isPickable: true,
            isVirtual: false,
            status: 'active'
        };
        setLocations(prev => [...prev, newLoc]);
    }

    setIsAddModalOpen(false);
  };

  const handleAddPreset = (preset: any) => {
    const newId = `preset-${Date.now()}`;
    const rootVisual = layoutVisuals.find(v => v.parentId === null);
    
    // Default position at 1/10th of the room size
    const defaultX = rootVisual ? rootVisual.width / 10 : 1000;
    const defaultY = rootVisual ? rootVisual.depth / 10 : 1000;

    const newVisual: VisualNode = {
      id: `v-${newId}`,
      layoutId: layout.id,
      locationId: null,
      type: preset.type as any,
      label: preset.label,
      x: defaultX, 
      y: defaultY,
      z: 0,
      rotation: 0,
      width: preset.w,
      height: preset.h,
      depth: preset.d,
      color: preset.color,
      viewMode: ViewMode.TOP_DOWN,
      parentId: rootVisual?.id || null,
      supportsFrontView: preset.supportsFrontView,
      supportsInteriorView: preset.supportsInteriorView
    };

    setVisuals(prev => [...prev, newVisual]);
    setSelectedNodeId(newVisual.id);
  };

  const handleUpdateNode = (id: string, updates: Partial<VisualNode>) => {
    setVisuals(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      <EditorToolbar 
        layoutName={layout.name}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        gridSize={gridSize}
        setGridSize={setGridSize}
        showRulers={showRulers}
        setShowRulers={setShowRulers}
        selectedNodeId={selectedNodeId}
        onBack={onBack}
        onAdd={() => setIsAddModalOpen(true)}
        onFitScreen={handleFitScreen}
      />

      <div className="flex-1 flex overflow-hidden">
        <EditorSidebarLeft 
          locations={locations}
          visuals={layoutVisuals}
          selectedId={selectedNodeId}
          onSelect={setSelectedNodeId}
          onAddPreset={handleAddPreset}
        />

        <div className="flex-1 relative bg-[#020617] flex flex-col">
           {viewMode === ViewMode.TOP_DOWN ? (
             <EditorCanvas 
               visuals={layoutVisuals}
               viewMode={viewMode}
               zoomLevel={zoomLevel}
               setZoomLevel={setZoomLevel}
               showGrid={showGrid}
               snapToGrid={snapToGrid}
               gridSize={gridSize}
               showRulers={showRulers}
               selectedNodeId={selectedNodeId}
               onSelectNode={setSelectedNodeId}
               onUpdateNode={handleUpdateNode}
               fitTrigger={fitTrigger}
             />
           ) : viewMode === ViewMode.FRONT && selectedNode && selectedNode.supportsFrontView ? (
             <FrontViewEditor 
               node={selectedNode}
               locations={locations}
               onUpdateNode={handleUpdateNode}
             />
           ) : (
             <EditorCanvas 
               visuals={layoutVisuals}
               viewMode={viewMode}
               zoomLevel={zoomLevel}
               setZoomLevel={setZoomLevel}
               showGrid={showGrid}
               snapToGrid={snapToGrid}
               gridSize={gridSize}
               showRulers={showRulers}
               selectedNodeId={selectedNodeId}
               onSelectNode={setSelectedNodeId}
               onUpdateNode={handleUpdateNode}
               fitTrigger={fitTrigger}
             />
           )}

           {/* Contextual Empty States */}
           {viewMode === ViewMode.FRONT && (!selectedNode || !selectedNode.supportsFrontView) && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
               <div className="max-w-md p-8 bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl text-center space-y-4">
                 <div className="w-16 h-16 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center mx-auto text-sky-400">
                   <Box className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-white uppercase tracking-tight">Front Context</h3>
                 <p className="text-slate-400 text-sm leading-relaxed">
                   Select a cabinet, rack, shelf unit, or wall storage object to edit its front view.
                 </p>
                 <button 
                   onClick={() => setViewMode(ViewMode.TOP_DOWN)}
                   className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                 >
                   Return to Top
                 </button>
               </div>
             </div>
           )}

           {viewMode === ViewMode.INTERIOR && (!selectedNode || !selectedNode.supportsInteriorView) && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
               <div className="max-w-md p-8 bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl text-center space-y-4">
                 <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                   <Package className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-white uppercase tracking-tight">Interior Context</h3>
                 <p className="text-slate-400 text-sm leading-relaxed">
                   Select a cabinet, drawer unit, shelf unit, or bin wall to edit its interior.
                 </p>
                 <button 
                   onClick={() => setViewMode(ViewMode.TOP_DOWN)}
                   className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                 >
                   Return to Top
                 </button>
               </div>
             </div>
           )}
        </div>

        <EditorSidebarRight 
          layout={layout}
          selectedNode={selectedNode}
          selectedLocation={selectedLocation}
          locations={locations}
          visuals={layoutVisuals}
          viewMode={viewMode}
          onUnlink={handleUnlink}
          onRemoveVisual={handleRemoveVisual}
          onUpdateNode={handleUpdateNode}
          onSetViewMode={setViewMode}
          onAssignLocation={(locId) => {
              if (selectedNode) {
                  setVisuals(prev => prev.map(v => v.id === selectedNode.id ? { ...v, locationId: locId } : v));
              }
          }}
          onCreateLocationFromVisual={() => {
              if (selectedNode) {
                  const newLocId = `l-gen-${Date.now()}`;
                  setLocations(prev => [...prev, {
                      id: newLocId,
                      code: `LOC-${selectedNode.label.toUpperCase()}`,
                      name: selectedNode.label,
                      parentId: null,
                      locationType: LocationType.RACK,
                      allowsStock: true,
                      isReceivable: true,
                      isPickable: true,
                      isVirtual: false,
                      status: 'active'
                  }]);
                  setVisuals(prev => prev.map(v => v.id === selectedNode.id ? { ...v, locationId: newLocId } : v));
              }
          }}
        />
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddObjectModal 
            onClose={() => setIsAddModalOpen(false)} 
            onSubmit={handleAddObject}
            locations={locations}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
