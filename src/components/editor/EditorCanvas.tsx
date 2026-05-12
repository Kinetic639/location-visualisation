import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva';
import { VisualNode, ViewMode } from '../../types';
import Konva from 'konva';

interface CanvasProps {
  visuals: VisualNode[];
  viewMode: ViewMode;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  selectedNodeIds: string[];
  onSelectNodes: (ids: string[]) => void;
  onUpdateNode: (id: string, updates: Partial<VisualNode>) => void;
  fitTrigger?: number;
}

export default function EditorCanvas({ 
  visuals, 
  viewMode, 
  zoomLevel, 
  setZoomLevel,
  showGrid, 
  snapToGrid,
  gridSize,
  showRulers,
  selectedNodeIds, 
  onSelectNodes,
  onUpdateNode,
  fitTrigger = 0
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [selectionRect, setSelectionRect] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);

  const scale = 0.1; // 1mm = 0.1px

  // Helper to check if a node ID is selected
  const isSelected = (id: string) => selectedNodeIds.includes(id);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const rootVisual = useMemo(() => visuals.find(v => v.parentId === null), [visuals]);
  const currentVisuals = useMemo(() => visuals.filter(v => v.viewMode === viewMode && v.parentId !== null), [visuals, viewMode]);

  // Handle box selection logic
  const handleBoxSelectionStart = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== e.target.getStage()) return;
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const pointer = stage.getRelativePointerPosition();
    if (!pointer) return;
    
    setSelectionRect({ x1: pointer.x, y1: pointer.y, x2: pointer.x, y2: pointer.y });
  };

  const handleBoxSelectionMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selectionRect) return;
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const pointer = stage.getRelativePointerPosition();
    if (!pointer) return;
    
    setSelectionRect(prev => prev ? { ...prev, x2: pointer.x, y2: pointer.y } : null);
  };

  const handleBoxSelectionEnd = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selectionRect) return;
    
    // Calculate final bounding box
    const x = Math.min(selectionRect.x1, selectionRect.x2);
    const y = Math.min(selectionRect.y1, selectionRect.y2);
    const width = Math.abs(selectionRect.x1 - selectionRect.x2);
    const height = Math.abs(selectionRect.y1 - selectionRect.y2);

    // Filter visuals that fall within the selection box
    const newlySelectedIds = currentVisuals.filter(v => {
      const vx = (v.x + v.width / 2) * scale - (v.width * scale) / 2;
      const vy = (v.y + v.depth / 2) * scale - (v.depth * scale) / 2;
      const vWidth = v.width * scale;
      const vHeight = v.depth * scale;
      
      return (
        vx >= x &&
        vy >= y &&
        vx + vWidth <= x + width &&
        vy + vHeight <= y + height
      );
    }).map(v => v.id);

    if (newlySelectedIds.length > 0) {
      if (e.evt.shiftKey) {
        // Toggle or add logic here, for now just add unique
        onSelectNodes([...new Set([...selectedNodeIds, ...newlySelectedIds])]);
      } else {
        onSelectNodes(newlySelectedIds);
      }
    } else {
        if (!e.evt.shiftKey) onSelectNodes([]);
    }

    setSelectionRect(null);
  };

  // Fit to screen effect
  useEffect(() => {
    if (rootVisual && dimensions.width > 0 && dimensions.height > 0) {
      const padding = 60;
      const availableWidth = dimensions.width - padding * 2;
      const availableHeight = dimensions.height - padding * 2;
      
      const floorWidthPx = rootVisual.width * scale;
      const floorHeightPx = rootVisual.depth * scale;
      
      const targetZoom = Math.min(
        availableWidth / floorWidthPx,
        availableHeight / floorHeightPx
      );
      
      const clampedZoom = Math.max(0.01, Math.min(5, targetZoom));
      
      const newX = (dimensions.width - floorWidthPx * clampedZoom) / 2;
      const newY = (dimensions.height - floorHeightPx * clampedZoom) / 2;
      
      setZoomLevel(clampedZoom);
      setPos({ x: newX, y: newY });
    }
  }, [fitTrigger, rootVisual?.id, rootVisual?.width, rootVisual?.depth, dimensions.width, dimensions.height]);

  const handleDragStart = (id: string) => {
    if (!isSelected(id)) {
        onSelectNodes([id]);
    }
    // Record initial positions of all selected nodes for multi-drag
    const positions: Record<string, { x: number, y: number }> = {};
    visuals.filter(v => selectedNodeIds.includes(v.id)).forEach(v => {
      positions[v.id] = { x: v.x, y: v.y };
    });
    // We'll store this in a ref or local state if needed, but for now we'll use delta calculation in handleDragMove
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    const node = e.target;
    const visual = visuals.find(v => v.id === id);
    if (!visual) return;

    // Calculate delta in cm based on the dragged node's new position
    const currentCenterX = node.x() / scale;
    const currentCenterY = node.y() / scale;
    
    let dx = currentCenterX - (visual.x + visual.width / 2);
    let dy = currentCenterY - (visual.y + visual.depth / 2);

    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;

    // Blocking check for all selected nodes
    const blockingZones = visuals.filter(v => v.type === 'zone' && v.blockPlacement && !selectedNodeIds.includes(v.id));
    
    // Function to find the max allowed delta given a direction
    const getMaxDelta = (propDx: number, propDy: number) => {
      let allowedDx = propDx;
      let allowedDy = propDy;

      // Check each selected node
      for (const selId of selectedNodeIds) {
        const v = visuals.find(node => node.id === selId);
        if (!v) continue;

        const nextX = v.x + allowedDx;
        const nextY = v.y + allowedDy;

        // Floor Bounds
        if (rootVisual) {
          if (nextX < 0) allowedDx -= nextX;
          if (nextX + v.width > rootVisual.width) allowedDx -= (nextX + v.width - rootVisual.width);
          if (nextY < 0) allowedDy -= nextY;
          if (nextY + v.depth > rootVisual.depth) allowedDy -= (nextY + v.depth - rootVisual.depth);
        }

        // Zone Collisions (Sliding)
        blockingZones.forEach(zone => {
          const vx1 = v.x + allowedDx;
          const vx2 = vx1 + v.width;
          const vy1 = v.y + allowedDy;
          const vy2 = vy1 + v.depth;

          const zx1 = zone.x;
          const zx2 = zone.x + zone.width;
          const zy1 = zone.y;
          const zy2 = zone.y + zone.depth;

          // If overlapping
          if (!(vx2 <= zx1 || vx1 >= zx2 || vy2 <= zy1 || vy1 >= zy2)) {
             // We hit a zone. Determine which edge we hit based on movement direction
             // This is a simple approximation: if we moved mostly X, stop at X bound
             const overlapX = Math.min(vx2 - zx1, zx2 - vx1);
             const overlapY = Math.min(vy2 - zy1, zy2 - vy1);

             if (overlapX < overlapY) {
               // Resolve X
               if (allowedDx > 0) allowedDx -= overlapX;
               else allowedDx += overlapX;
             } else {
               // Resolve Y
               if (allowedDy > 0) allowedDy -= overlapY;
               else allowedDy += overlapY;
             }
          }
        });
      }
      return { dx: allowedDx, dy: allowedDy };
    };

    // First try the full move, then resolve collisions
    const finalDelta = getMaxDelta(dx, dy);
    
    // Update all selected nodes by the allowed delta
    if (Math.abs(finalDelta.dx) > 0.001 || Math.abs(finalDelta.dy) > 0.001) {
      const updates = selectedNodeIds.map(selectedId => {
        const v = visuals.find(node => node.id === selectedId);
        if (!v) return null;
        return { 
          id: selectedId, 
          updates: { 
            x: v.x + finalDelta.dx, 
            y: v.y + finalDelta.dy 
          } 
        };
      }).filter((u): u is { id: string, updates: any } => u !== null);

      onUpdateNodes(updates);
    }

    // Sync the dragged node's visual position to the state-derived position
    // to prevent it from moving independently of the validation logic
    const syncedVisual = visuals.find(v => v.id === id);
    if (syncedVisual) {
      node.x((syncedVisual.x + syncedVisual.width / 2) * scale);
      node.y((syncedVisual.y + syncedVisual.depth / 2) * scale);
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    // No-op or minor cleanup as movement is handled in real-time in handleDragMove
  };

  const getDragBoundFunc = (visualId: string) => {
    return function(this: Konva.Node, posArg: Konva.Vector2d) {
      if (!rootVisual || !stageRef.current) return posArg;
      
      const visual = visuals.find(v => v.id === visualId);
      if (!visual) return posArg;

      const stage = stageRef.current;
      const sX = stage.x();
      const sY = stage.y();
      const sScale = stage.scaleX();

      let localCenterX = (posArg.x - sX) / sScale;
      let localCenterY = (posArg.y - sY) / sScale;

      const rad = (visual.rotation || 0) * Math.PI / 180;
      const wPx = visual.width * scale;
      const hPx = visual.depth * scale;
      
      const boundingHw = (Math.abs(wPx * Math.cos(rad)) + Math.abs(hPx * Math.sin(rad))) / 2;
      const boundingHh = (Math.abs(wPx * Math.sin(rad)) + Math.abs(hPx * Math.cos(rad))) / 2;

      const minCenterX = boundingHw;
      const minCenterY = boundingHh;
      const maxCenterX = rootVisual.width * scale - boundingHw;
      const maxCenterY = rootVisual.depth * scale - boundingHh;

      localCenterX = Math.max(minCenterX, Math.min(maxCenterX, localCenterX));
      localCenterY = Math.max(minCenterY, Math.min(maxCenterY, localCenterY));

      return { 
        x: localCenterX * sScale + sX, 
        y: localCenterY * sScale + sY 
      };
    };
  };

  // Helper to render zone pattern
  const ZonePatternLayer = ({ node }: { node: VisualNode }) => {
    if (node.type !== 'zone' || !node.zonePattern || node.zonePattern === 'solid') return null;
    
    const w = node.width * scale;
    const d = node.depth * scale;
    const lines = [];
    const secondary = node.secondaryColor || 'rgba(0,0,0,0.2)';

    if (node.zonePattern.startsWith('stripes') || node.zonePattern.startsWith('diagonal')) {
      const isWide = node.zonePattern.includes('wide');
      const isDiagonal = node.zonePattern.startsWith('diagonal');
      const spacing = (isWide ? 25 : 8) * scale;
      const strokeWidth = (isWide ? 15 : 4) * scale;

      if (isDiagonal) {
        for (let i = -d; i < w + d; i += spacing * 2) {
            lines.push(
              <Line
                key={i}
                points={[i, 0, i + d, d]}
                stroke={secondary}
                strokeWidth={strokeWidth}
                opacity={0.3}
              />
            );
          }
      } else {
        // Vertical stripes
        for (let i = 0; i < w + spacing; i += spacing * 2) {
            lines.push(
                <Rect 
                    key={i}
                    x={i} y={0} width={strokeWidth} height={d}
                    fill={secondary}
                    opacity={0.2}
                />
            );
        }
      }
    } else if (node.zonePattern === 'dots') {
       const spacing = 12 * scale;
       for (let ix = spacing; ix < w; ix += spacing * 2) {
         for (let iy = spacing; iy < d; iy += spacing * 2) {
            lines.push(
              <Rect 
                key={`${ix}-${iy}`}
                x={ix} y={iy} width={2 * scale} height={2 * scale}
                fill={secondary}
                opacity={0.5}
              />
            );
         }
       }
    } else if (node.zonePattern === 'grid') {
      const spacing = 30 * scale;
      for (let x = 0; x <= w; x += spacing) {
        lines.push(<Line key={`gx-${x}`} points={[x, 0, x, d]} stroke={secondary} strokeWidth={0.5 / zoomLevel} opacity={0.3} />);
      }
      for (let y = 0; y <= d; y += spacing) {
        lines.push(<Line key={`gy-${y}`} points={[0, y, w, y]} stroke={secondary} strokeWidth={0.5 / zoomLevel} opacity={0.3} />);
      }
    }

    return <Group clipFunc={(ctx) => ctx.rect(0, 0, w, d)}>{lines}</Group>;
  };

  // Generate grid lines
  const gridLines = useMemo(() => {
    if (!showGrid || !rootVisual) return [];
    const lines = [];
    
    const stroke = "#2e3b52";
    const strokeWidth = 1 / zoomLevel;

    // Vertical lines
    for (let x = 0; x <= rootVisual.width; x += gridSize) {
      lines.push(
        <Line 
          key={`v-${x}`}
          points={[x * scale, 0, x * scale, rootVisual.depth * scale]}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={x % 100 === 0 ? 0.8 : 0.3}
        />
      );
    }
    // Horizontal lines
    for (let y = 0; y <= rootVisual.depth; y += gridSize) {
      lines.push(
        <Line 
          key={`h-${y}`}
          points={[0, y * scale, rootVisual.width * scale, y * scale]}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={y % 100 === 0 ? 0.8 : 0.3}
        />
      );
    }
    return lines;
  }, [showGrid, rootVisual, gridSize, zoomLevel]);

  // DOM rulers
  const Ruler = ({ orientation }: { orientation: 'horizontal' | 'horizontal-bottom' | 'vertical' | 'vertical-right' }) => {
    if (!showRulers || !rootVisual) return null;

    const isHorizontal = orientation.startsWith('horizontal');
    const isBottom = orientation === 'horizontal-bottom';
    const isRight = orientation === 'vertical-right';
    
    const majorStep = 100; // 1m
    const minorStep = 10;  // 10cm
    
    const ticks = [];
    
    // Bounds for world coordinates in cm
    const startWorldCm = (0 - (isHorizontal ? pos.x : pos.y)) / (zoomLevel * scale);
    const endWorldCm = ((isHorizontal ? dimensions.width : dimensions.height) - (isHorizontal ? pos.x : pos.y)) / (zoomLevel * scale);
    
    const startTick = Math.max(0, Math.floor(startWorldCm / minorStep) * minorStep);
    const endTick = Math.min(isHorizontal ? rootVisual.width : rootVisual.depth, Math.ceil(endWorldCm / minorStep) * minorStep);

    for (let cm = startTick; cm <= endTick; cm += minorStep) {
       const isMajor = cm % majorStep === 0;
       const px = (cm * scale * zoomLevel) + (isHorizontal ? pos.x : pos.y);
       
       ticks.push(
         <div 
           key={cm}
           className={`absolute ${isMajor ? 'bg-slate-500' : 'bg-slate-700'}`}
           style={{
             left: isHorizontal ? px : undefined,
             top: !isHorizontal ? px : undefined,
             [isHorizontal ? 'width' : 'height']: '1.5px',
             [isHorizontal ? 'height' : 'width']: isMajor ? '100%' : '30%',
             [isHorizontal ? (isBottom ? 'top' : 'bottom') : (isRight ? 'left' : 'right')]: 0,
           }}
         >
           {isMajor && (
             <span 
               className={`absolute text-[8px] font-bold text-slate-400 whitespace-nowrap ${isHorizontal ? 'left-1 top-0' : 'top-1 left-0'}`}
               style={{ 
                 transform: !isHorizontal ? (isRight ? 'rotate(90deg)' : 'rotate(-90deg)') : undefined, 
                 transformOrigin: !isHorizontal ? (isRight ? 'top left' : 'top right') : undefined 
               }}
             >
               {cm / 100}m
             </span>
           )}
         </div>
       );
    }

    return (
      <div 
        className={`absolute bg-[#0f172a] border-slate-800/50 backdrop-blur-sm ${isHorizontal ? 'left-0 right-0 h-[22px]' : 'top-0 bottom-0 w-6'} z-30`}
        style={{ 
          top: isHorizontal && !isBottom ? 0 : undefined,
          bottom: isBottom ? 0 : undefined,
          left: !isHorizontal && !isRight ? 0 : undefined,
          right: isRight ? 0 : undefined,
          borderTopWidth: isBottom ? '1px' : 0,
          borderBottomWidth: (isHorizontal && !isBottom) ? '1px' : 0,
          borderLeftWidth: isRight ? '1px' : 0,
          borderRightWidth: (!isHorizontal && !isRight) ? '1px' : 0,
          borderStyle: 'solid'
        }}
      >
        {ticks}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#020617] relative overflow-hidden">
      {/* HUD Rulers */}
      {showRulers && (
        <>
          <Ruler orientation="horizontal" />
          <Ruler orientation="horizontal-bottom" />
          <Ruler orientation="vertical" />
          <Ruler orientation="vertical-right" />
        </>
      )}

      <Stage 
        ref={stageRef}
        width={dimensions.width} 
        height={dimensions.height}
        draggable={!selectionRect}
        onMouseDown={handleBoxSelectionStart}
        onMouseMove={(e) => {
            if (selectionRect) {
                handleBoxSelectionMove(e);
            } else if (e.target instanceof Konva.Stage && e.target.isDragging()) {
                setPos({ x: e.target.x(), y: e.target.y() });
            }
        }}
        onMouseUp={handleBoxSelectionEnd}
        onClick={(e) => {
          // If click on empty area (not node, not group)
          if (e.target === e.target.getStage()) {
            if (!e.evt.shiftKey) onSelectNodes([]);
          }
        }}
        scaleX={zoomLevel}
        scaleY={zoomLevel}
        x={pos.x}
        y={pos.y}
        onWheel={(e) => {
            e.evt.preventDefault();
            const stage = stageRef.current;
            if (!stage) return;
            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition();
            if (!pointer) return;

            const mousePointTo = {
              x: (pointer.x - stage.x()) / oldScale,
              y: (pointer.y - stage.y()) / oldScale,
            };

            const direction = e.evt.deltaY > 0 ? -1 : 1;
            const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;

            stage.scale({ x: newScale, y: newScale });
            const newPos = {
              x: pointer.x - mousePointTo.x * newScale,
              y: pointer.y - mousePointTo.y * newScale,
            };
            stage.position(newPos);
            setZoomLevel(newScale);
            setPos(newPos);
          }}
      >
        <Layer>
            {/* The Floor */}
            {rootVisual && (
                <Rect 
                  x={0}
                  y={0}
                  width={rootVisual.width * scale}
                  height={rootVisual.depth * scale}
                  fill="#111827"
                  stroke={isSelected(rootVisual.id) ? "#0ea5e9" : "#334155"}
                  strokeWidth={2 / zoomLevel}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    if (e.evt.shiftKey) {
                        onSelectNodes(isSelected(rootVisual.id) 
                          ? selectedNodeIds.filter(id => id !== rootVisual.id)
                          : [...selectedNodeIds, rootVisual.id]
                        );
                    } else {
                        onSelectNodes([rootVisual.id]);
                    }
                  }}
                />
            )}

            {/* Grid */}
            {gridLines}

            {/* Visual Objects */}
            {currentVisuals.map(v => (
                <Group 
                  key={v.id}
                  x={(v.x + v.width / 2) * scale}
                  y={(v.y + v.depth / 2) * scale}
                  offsetX={(v.width * scale) / 2}
                  offsetY={(v.depth * scale) / 2}
                  rotation={v.rotation}
                  draggable
                  dragBoundFunc={getDragBoundFunc(v.id)}
                  onDragStart={() => handleDragStart(v.id)}
                  onDragMove={(e) => handleDragMove(e, v.id)}
                  onDragEnd={(e) => handleDragEnd(e, v.id)}
                  onClick={(e) => {
                      e.cancelBubble = true;
                      if (e.evt.shiftKey) {
                          onSelectNodes(isSelected(v.id) 
                            ? selectedNodeIds.filter(id => id !== v.id)
                            : [...selectedNodeIds, v.id]
                          );
                      } else {
                          onSelectNodes([v.id]);
                      }
                  }}
                >
                    <Rect 
                      width={v.width * scale}
                      height={v.depth * scale}
                      fill={v.type === 'zone' ? (isSelected(v.id) ? `${v.color}66` : `${v.color}22`) : (isSelected(v.id) ? "#0ea5e944" : "#1e293b")}
                      stroke={isSelected(v.id) ? (v.type === 'zone' ? v.color : "#0ea5e9") : (v.type === 'zone' ? `${v.color}44` : "#475569")}
                      strokeWidth={v.type === 'industrial' ? (2 / zoomLevel) : (1 / zoomLevel)}
                      cornerRadius={v.type === 'industrial' ? (0) : (2 / zoomLevel)}
                      dash={v.type === 'zone' ? [5 / zoomLevel, 5 / zoomLevel] : []}
                    />
                    
                    {v.type === 'zone' && <ZonePatternLayer node={v} />}

                    {v.type === 'industrial' && (
                       <Rect 
                         width={v.width * scale}
                         height={v.depth * scale}
                         fill="transparent"
                         stroke={isSelected(v.id) ? "#38bdf8" : "#94a3b8"}
                         strokeWidth={0.5 / zoomLevel}
                         opacity={0.3}
                       />
                    )}
                    
                    {/* Front Side Indicator */}
                    {v.frontSide && (
                      <Line 
                        points={
                          v.frontSide === 'top' ? [0, 0, v.width * scale, 0] :
                          v.frontSide === 'bottom' ? [0, v.depth * scale, v.width * scale, v.depth * scale] :
                          v.frontSide === 'left' ? [0, 0, 0, v.depth * scale] :
                          v.frontSide === 'right' ? [v.width * scale, 0, v.width * scale, v.depth * scale] :
                          []
                        }
                        stroke="#38bdf8"
                        strokeWidth={4 / zoomLevel}
                        lineCap="round"
                        opacity={0.8}
                      />
                    )}

                    <Text 
                       text={v.label}
                       fontSize={10 / zoomLevel}
                       fill={isSelected(v.id) ? "#7dd3fc" : "#94a3b8"}
                       y={v.depth * scale + (4 / zoomLevel)}
                       width={v.width * scale}
                       align="center"
                       fontStyle="bold"
                    />
                </Group>
            ))}

            {/* Selection Rectangle */}
            {selectionRect && (
                <Rect 
                  x={Math.min(selectionRect.x1, selectionRect.x2)}
                  y={Math.min(selectionRect.y1, selectionRect.y2)}
                  width={Math.abs(selectionRect.x1 - selectionRect.x2)}
                  height={Math.abs(selectionRect.y1 - selectionRect.y2)}
                  fill="rgba(14, 165, 233, 0.2)"
                  stroke="#0ea5e9"
                  strokeWidth={1 / zoomLevel}
                  dash={[4 / zoomLevel, 4 / zoomLevel]}
                />
            )}
        </Layer>
      </Stage>
    </div>
  );
}
