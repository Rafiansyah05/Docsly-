'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  padding?: number;
}

interface TourContextType {
  startTour: (tourId: string, steps: TourStep[], onComplete?: () => void, showSkipAll?: boolean, hasSeen?: boolean, userId?: string) => void;
  stopTour: () => void;
  nextStep: () => void;
  skipAll: () => void;
  isActive: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) throw new Error('useTour must be used within a TourProvider');
  return context;
}

interface TourProviderProps {
  children: React.ReactNode;
  initialToursStatus?: Record<string, boolean>;
}

export function TourProvider({ children, initialToursStatus = {} }: TourProviderProps) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSkipAll, setShowSkipAll] = useState(false);
  const [onCompleteCallback, setOnCompleteCallback] = useState<(() => void) | null>(null);
  
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const toursStatusRef = useRef(initialToursStatus);
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const startTour = useCallback((tourId: string, newSteps: TourStep[], onComplete?: () => void, allowSkipAll = false, hasSeen?: boolean, userId?: string) => {
    if (userId) setCurrentUserId(userId);
    const key = userId ? `tour_completed_${tourId}_${userId}` : `tour_completed_${tourId}`;
    
    // Check if already seen in backend or localstorage
    if (hasSeen || toursStatusRef.current[tourId] || localStorage.getItem(key) === 'true') {
      return;
    }
    
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setActiveTourId(tourId);
    setShowSkipAll(allowSkipAll);
    if (onComplete) setOnCompleteCallback(() => onComplete);
  }, []);

  const stopTour = useCallback(() => {
    if (activeTourId) {
      const key = currentUserId ? `tour_completed_${activeTourId}_${currentUserId}` : `tour_completed_${activeTourId}`;
      localStorage.setItem(key, 'true');
      toursStatusRef.current[activeTourId] = true;
      // Sync to database
      fetch('/api/user/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId: activeTourId })
      }).catch(err => console.error('Failed to sync tour status', err));
    }
    setActiveTourId(null);
    setSteps([]);
    setTargetRect(null);
    if (onCompleteCallback) onCompleteCallback();
  }, [activeTourId, onCompleteCallback, currentUserId]);

  const skipAll = useCallback(() => {
    if (activeTourId) {
      const currentKey = currentUserId ? `tour_completed_${activeTourId}_${currentUserId}` : `tour_completed_${activeTourId}`;
      const editorKey = currentUserId ? `tour_completed_editor_tour_${currentUserId}` : `tour_completed_editor_tour`;
      
      localStorage.setItem(currentKey, 'true');
      localStorage.setItem(editorKey, 'true');
      toursStatusRef.current[activeTourId] = true;
      toursStatusRef.current['editor_tour'] = true;
      
      // Sync current tour
      fetch('/api/user/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId: activeTourId })
      }).catch(err => console.error(err));
      
      // Also sync editor tour if skipping all
      if (activeTourId !== 'editor_tour') {
        fetch('/api/user/tours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tourId: 'editor_tour' })
        }).catch(err => console.error(err));
      }
    }
    setActiveTourId(null);
    setSteps([]);
    setTargetRect(null);
    if (onCompleteCallback) onCompleteCallback();
  }, [activeTourId, onCompleteCallback, currentUserId]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      stopTour();
    }
  }, [currentStepIndex, steps.length, stopTour]);

  // Update target rect when step changes or on resize/scroll
  useEffect(() => {
    if (!activeTourId) return;

    const updateRect = () => {
      const currentStep = steps[currentStepIndex];
      if (!currentStep) return;

      const el = document.getElementById(currentStep.targetId);
      if (el) {
        // Scroll into view if needed
        const rect = el.getBoundingClientRect();
        const isInView = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        if (!isInView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          // Wait for scroll to finish
          setTimeout(() => {
            setTargetRect(el.getBoundingClientRect());
          }, 350);
        } else {
          setTargetRect(rect);
        }
      } else {
        // Element not found, might be rendered conditionally, skip or wait?
        // For simplicity, we just set null, tooltip will center on screen
        setTargetRect(null);
      }
    };

    updateRect();
    
    // Add listeners
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [activeTourId, currentStepIndex, steps]);

  return (
    <TourContext.Provider value={{ startTour, stopTour, nextStep, skipAll, isActive: !!activeTourId }}>
      {children}
      <TourOverlay 
        isActive={!!activeTourId}
        step={steps[currentStepIndex]}
        targetRect={targetRect}
        onNext={nextStep}
        onSkip={skipAll}
        isLastStep={currentStepIndex === steps.length - 1}
        showSkipAll={showSkipAll}
      />
    </TourContext.Provider>
  );
}

interface TourOverlayProps {
  isActive: boolean;
  step?: TourStep;
  targetRect: DOMRect | null;
  onNext: () => void;
  onSkip: () => void;
  isLastStep: boolean;
  showSkipAll: boolean;
}

function TourOverlay({ isActive, step, targetRect, onNext, onSkip, isLastStep, showSkipAll }: TourOverlayProps) {
  if (!isActive || !step) return null;

  const padding = step.padding ?? 8;
  
  // Calculate mask path for CSS clip-path or SVG mask
  // We will use SVG mask for smooth blurred background with cut out
  const maskProps = targetRect ? {
    x: targetRect.left - padding,
    y: targetRect.top - padding,
    width: targetRect.width + (padding * 2),
    height: targetRect.height + (padding * 2),
    rx: 8 // border radius for cutout
  } : null;

  // Calculate Popover Position
  let popoverStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  };

  if (targetRect) {
    const spacing = 16;
    const popoverWidth = 320;
    const popoverHeight = 150; // estimated
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let pos = step.position || 'auto';

    // Auto positioning logic
    if (pos === 'auto') {
      const spaceRight = viewportW - (targetRect.right + padding);
      const spaceLeft = targetRect.left - padding;
      const spaceBottom = viewportH - (targetRect.bottom + padding);
      const spaceTop = targetRect.top - padding;

      // Prefer right, then bottom, then left, then top
      if (spaceRight > popoverWidth + spacing) pos = 'right';
      else if (spaceBottom > popoverHeight + spacing) pos = 'bottom';
      else if (spaceLeft > popoverWidth + spacing) pos = 'left';
      else pos = 'top';
    }

    switch (pos) {
      case 'right':
        popoverStyle = {
          left: targetRect.right + padding + spacing,
          top: Math.max(spacing, Math.min(viewportH - popoverHeight - spacing, targetRect.top + targetRect.height/2 - popoverHeight/2))
        };
        break;
      case 'left':
        popoverStyle = {
          left: targetRect.left - padding - spacing - popoverWidth,
          top: Math.max(spacing, Math.min(viewportH - popoverHeight - spacing, targetRect.top + targetRect.height/2 - popoverHeight/2))
        };
        break;
      case 'bottom':
        popoverStyle = {
          top: targetRect.bottom + padding + spacing,
          left: Math.max(spacing, Math.min(viewportH - popoverWidth - spacing, targetRect.left + targetRect.width/2 - popoverWidth/2))
        };
        break;
      case 'top':
        popoverStyle = {
          top: targetRect.top - padding - spacing - popoverHeight,
          left: Math.max(spacing, Math.min(viewportH - popoverWidth - spacing, targetRect.left + targetRect.width/2 - popoverWidth/2))
        };
        break;
    }
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[99999] pointer-events-none"
        >
          {/* 4-Piece Backdrop for Blur and Dim */}
          {maskProps ? (
            <>
              {/* Top */}
              <motion.div
                initial={false}
                animate={{ height: Math.max(0, maskProps.y) }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                className="absolute top-0 left-0 right-0 bg-black/45 backdrop-blur-[4px] pointer-events-auto"
              />
              {/* Bottom */}
              <motion.div
                initial={false}
                animate={{ top: maskProps.y + maskProps.height }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                className="absolute bottom-0 left-0 right-0 bg-black/45 backdrop-blur-[4px] pointer-events-auto"
              />
              {/* Left */}
              <motion.div
                initial={false}
                animate={{
                  top: maskProps.y,
                  height: maskProps.height,
                  width: Math.max(0, maskProps.x),
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                className="absolute left-0 bg-black/45 backdrop-blur-[4px] pointer-events-auto"
              />
              {/* Right */}
              <motion.div
                initial={false}
                animate={{
                  top: maskProps.y,
                  height: maskProps.height,
                  left: maskProps.x + maskProps.width,
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                className="absolute right-0 bg-black/45 backdrop-blur-[4px] pointer-events-auto"
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[4px] pointer-events-auto" />
          )}

          {/* Popover Content */}
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.5, delay: 0.1 }}
            style={popoverStyle}
            className="absolute pointer-events-auto w-[320px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-2xl font-sans"
          >
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-zinc-100 mb-2 leading-tight">
              {step.title}
            </h3>
            <p className="text-[14px] text-slate-600 dark:text-zinc-400 mb-5 leading-relaxed whitespace-pre-line">
              {step.content}
            </p>
            
            <div className="flex items-center justify-between mt-2 gap-2">
              <div className="flex-1">
                {showSkipAll && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onSkip}
                    className="text-xs h-8 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    Mengerti Semua
                  </Button>
                )}
              </div>
              <Button size="sm" onClick={onNext} className="h-8 px-4 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
                {isLastStep ? 'Selesai' : 'Mengerti'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
