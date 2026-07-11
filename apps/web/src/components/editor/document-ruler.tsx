import React, { useRef, useState, useEffect } from 'react';

// Konstanta Konversi (sekitar 96 DPI)
const CM_TO_PX = 37.795; 
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const PAGE_GAP = 40;
const FULL_PAGE_STEP = PAGE_HEIGHT + PAGE_GAP;

export interface DocumentLayout {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface HorizontalRulerProps {
  layout: DocumentLayout;
  onChange: (layout: DocumentLayout) => void;
}

export function HorizontalRuler({ layout, onChange }: HorizontalRulerProps) {
  const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, PAGE_WIDTH));

      if (isDragging === 'left') {
        const newLeft = Math.min(x, PAGE_WIDTH - layout.right - 50); // Minimal 50px jarak text
        onChange({ ...layout, left: newLeft });
      } else if (isDragging === 'right') {
        const newRight = Math.min(PAGE_WIDTH - x, PAGE_WIDTH - layout.left - 50);
        onChange({ ...layout, right: newRight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, layout, onChange]);

  // Generate ticks
  const ticks = [];
  const maxCm = Math.ceil(PAGE_WIDTH / CM_TO_PX);
  for (let i = 0; i <= maxCm; i++) {
    const px = i * CM_TO_PX;
    ticks.push(
      <g key={`tick-${i}`}>
        <line x1={px} y1="14" x2={px} y2="24" stroke="#cbd5e1" strokeWidth="1" />
        {i % 1 === 0 && <text x={px} y="11" fontSize="9" fill="#94a3b8" textAnchor="middle">{i}</text>}
        <line x1={px + CM_TO_PX/2} y1="18" x2={px + CM_TO_PX/2} y2="24" stroke="#e2e8f0" strokeWidth="1" />
      </g>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative h-6 bg-[#f8fafc] border border-slate-200 select-none overflow-hidden mx-auto"
      style={{ width: PAGE_WIDTH }}
    >
      {/* Area Margin Abu-abu */}
      <div className="absolute top-0 bottom-0 left-0 bg-slate-200/50" style={{ width: layout.left }} />
      <div className="absolute top-0 bottom-0 right-0 bg-slate-200/50" style={{ width: layout.right }} />
      
      {/* Garis Mistar (Ticks) */}
      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
        {ticks}
      </svg>

      {/* Handle Kiri */}
      <div 
        className="absolute top-0 bottom-0 w-3 -ml-1.5 cursor-col-resize z-10 flex items-end justify-center group"
        style={{ left: layout.left }}
        onMouseDown={() => setIsDragging('left')}
      >
        <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-slate-400 group-hover:border-b-blue-500 mb-0.5 transition-colors" />
      </div>

      {/* Handle Kanan */}
      <div 
        className="absolute top-0 bottom-0 w-3 -mr-1.5 cursor-col-resize z-10 flex items-end justify-center group"
        style={{ right: layout.right }}
        onMouseDown={() => setIsDragging('right')}
      >
        <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-slate-400 group-hover:border-b-blue-500 mb-0.5 transition-colors" />
      </div>
    </div>
  );
}

interface VerticalRulerProps {
  layout: DocumentLayout;
  onChange: (layout: DocumentLayout) => void;
  totalPages: number;
}

export function VerticalRuler({ layout, onChange, totalPages }: VerticalRulerProps) {
  const [isDragging, setIsDragging] = useState<'top' | 'bottom' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Calculate Y relative to the very top of the ruler container (across all pages)
      const y = Math.max(0, e.clientY - rect.top);

      // Figure out which page this Y belongs to
      const pageIndex = Math.floor(y / FULL_PAGE_STEP);
      const relativeY = y - (pageIndex * FULL_PAGE_STEP);

      // Limit dragging within valid page boundaries
      if (relativeY >= 0 && relativeY <= PAGE_HEIGHT) {
        if (isDragging === 'top') {
          // Adjust top margin based on relative position within the page
          const newTop = Math.min(relativeY, PAGE_HEIGHT - layout.bottom - 50);
          onChange({ ...layout, top: newTop });
        } else if (isDragging === 'bottom') {
          // Adjust bottom margin based on distance from the bottom of the page
          const distanceToBottom = PAGE_HEIGHT - relativeY;
          const newBottom = Math.min(distanceToBottom, PAGE_HEIGHT - layout.top - 50);
          onChange({ ...layout, bottom: newBottom });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, layout, onChange]);

  return (
    <div 
      ref={containerRef}
      className="relative w-6 bg-slate-50 border-r border-slate-200 select-none flex-shrink-0"
      style={{ height: totalPages * FULL_PAGE_STEP - PAGE_GAP }}
    >
      {Array.from({ length: totalPages }).map((_, pIndex) => {
        const topOffset = pIndex * FULL_PAGE_STEP;
        
        // Generate SVG ticks for this specific page
        const ticks = [];
        const maxCm = Math.ceil(PAGE_HEIGHT / CM_TO_PX);
        for (let i = 0; i <= maxCm; i++) {
          const py = i * CM_TO_PX;
          if (py <= PAGE_HEIGHT) {
            ticks.push(
              <g key={`vtick-${pIndex}-${i}`}>
                <line x1="14" y1={py} x2="24" y2={py} stroke="#cbd5e1" strokeWidth="1" />
                {i % 1 === 0 && <text x="11" y={py + 3} fontSize="9" fill="#94a3b8" textAnchor="end">{i}</text>}
                <line x1="18" y1={py + CM_TO_PX/2} x2="24" y2={py + CM_TO_PX/2} stroke="#e2e8f0" strokeWidth="1" />
              </g>
            );
          }
        }

        return (
          <div 
            key={`page-ruler-${pIndex}`}
            className="absolute w-full"
            style={{ top: topOffset, height: PAGE_HEIGHT }}
          >
            {/* Top Margin Area (Gray) */}
            <div className="absolute top-0 left-0 right-0 bg-slate-200/50" style={{ height: layout.top }} />
            
            {/* Bottom Margin Area (Gray) */}
            <div className="absolute bottom-0 left-0 right-0 bg-slate-200/50" style={{ height: layout.bottom }} />
            
            {/* Ticks */}
            <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
              {ticks}
            </svg>

            {/* Top Margin Handle */}
            <div 
              className="absolute left-0 right-0 h-3 -mt-1.5 cursor-row-resize z-10 flex items-center justify-end group pr-0.5"
              style={{ top: layout.top }}
              onMouseDown={() => setIsDragging('top')}
            >
              <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-r-[8px] border-t-transparent border-b-transparent border-r-slate-400 group-hover:border-r-blue-500 transition-colors" />
            </div>

            {/* Bottom Margin Handle */}
            <div 
              className="absolute left-0 right-0 h-3 -mb-1.5 cursor-row-resize z-10 flex items-center justify-end group pr-0.5"
              style={{ bottom: layout.bottom }}
              onMouseDown={() => setIsDragging('bottom')}
            >
              <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-r-[8px] border-t-transparent border-b-transparent border-r-slate-400 group-hover:border-r-blue-500 transition-colors" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
