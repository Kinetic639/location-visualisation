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
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
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
  selectedNodeId, 
  onSelectNode,
  onUpdateNode,
  fitTrigger = 0
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const scale = 0.1; // 1mm = 0.1px

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

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    const node = e.target;
    // Position is already snapped if we use dragBoundFunc
    onUpdateNode(id, { 
      x: node.x() / scale, 
      y: node.y() / scale 
    });
  };

  const getDragBoundFunc = (visualId: string) => {
    return function(this: Konva.Node, posArg: Konva.Vector2d) {
      if (!rootVisual || !stageRef.current) return posArg;
      
      const visual = visuals.find(v => v.id === visualId);
      if (!visual) return posArg;

      // Stage transform is critical because dragBoundFunc receives absolute coordinates
      const stage = stageRef.current;
      const sX = stage.x();
      const sY = stage.y();
      const sScale = stage.scaleX();

      // Convert absolute screen pixels to local layer pixels (world pixels where 1mm = 0.1px)
      let localX = (posArg.x - sX) / sScale;
      let localY = (posArg.y - sY) / sScale;

      // Boundary constraints in local pixels
      const minX = 0;
      const minY = 0;
      const maxX = (rootVisual.width - visual.width) * scale;
      const maxY = (rootVisual.depth - visual.depth) * scale;

      // Apply clamping to keep within floor bounds
      localX = Math.max(minX, Math.min(maxX, localX));
      localY = Math.max(minY, Math.min(maxY, localY));

      // Snapping logic in local pixels
      // gridSize is in mm. 10mm (1cm) is our base unit for rounding.
      const baseUnitMm = 10;
      const snapMm = snapToGrid ? gridSize : baseUnitMm;
      const snapPx = snapMm * scale;
      
      localX = Math.round(localX / snapPx) * snapPx;
      localY = Math.round(localY / snapPx) * snapPx;

      // Convert back to absolute coordinates for Konva
      return { 
        x: localX * sScale + sX, 
        y: localY * sScale + sY 
      };
    };
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
          opacity={x % 1000 === 0 ? 0.8 : 0.3}
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
          opacity={y % 1000 === 0 ? 0.8 : 0.3}
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
    
    const majorStep = 1000; // 1m
    const minorStep = 100;  // 10cm
    
    const ticks = [];
    
    // Bounds for world coordinates in mm
    const startWorldMm = (0 - (isHorizontal ? pos.x : pos.y)) / (zoomLevel * scale);
    const endWorldMm = ((isHorizontal ? dimensions.width : dimensions.height) - (isHorizontal ? pos.x : pos.y)) / (zoomLevel * scale);
    
    const startTick = Math.max(0, Math.floor(startWorldMm / minorStep) * minorStep);
    const endTick = Math.min(isHorizontal ? rootVisual.width : rootVisual.depth, Math.ceil(endWorldMm / minorStep) * minorStep);

    for (let mm = startTick; mm <= endTick; mm += minorStep) {
       const isMajor = mm % majorStep === 0;
       const px = (mm * scale * zoomLevel) + (isHorizontal ? pos.x : pos.y);
       
       ticks.push(
         <div 
           key={mm}
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
               {mm / 1000}m
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
        draggable
        onDragMove={(e) => {
            if (e.target instanceof Konva.Stage) {
                setPos({ x: e.target.x(), y: e.target.y() });
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
                  stroke={selectedNodeId === rootVisual.id ? "#0ea5e9" : "#334155"}
                  strokeWidth={2 / zoomLevel}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    onSelectNode(rootVisual.id);
                  }}
                />
            )}

            {/* Grid */}
            {gridLines}

            {/* Visual Objects */}
            {currentVisuals.map(v => (
                <Group 
                  key={v.id}
                  x={v.x * scale}
                  y={v.y * scale}
                  rotation={v.rotation}
                  draggable
                  dragBoundFunc={getDragBoundFunc(v.id)}
                  onDragEnd={(e) => handleDragEnd(e, v.id)}
                  onClick={(e) => {
                      e.cancelBubble = true;
                      onSelectNode(v.id);
                  }}
                >
                    <Rect 
                      width={v.width * scale}
                      height={v.depth * scale}
                      fill={v.id === selectedNodeId ? "#0ea5e944" : "#1e293b"}
                      stroke={v.id === selectedNodeId ? "#0ea5e9" : "#475569"}
                      strokeWidth={1 / zoomLevel}
                      cornerRadius={2 / zoomLevel}
                    />
                    
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
                       fill={v.id === selectedNodeId ? "#7dd3fc" : "#94a3b8"}
                       y={v.depth * scale + (4 / zoomLevel)}
                       width={v.width * scale}
                       align="center"
                       fontStyle="bold"
                    />
                </Group>
            ))}
        </Layer>
      </Stage>
    </div>
  );
}
