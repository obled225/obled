'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface FloatingAnnouncementProps {
  message: string;
  onClose?: () => void;
}

export function FloatingAnnouncement({
  message = 'Use code WELCOME20 for 20% off',
  onClose,
}: FloatingAnnouncementProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show announcement after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setIsDismissed(true);
    onClose?.();
  }, [onClose]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newOffset = {
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      };
      setDragOffset(newOffset);

      // Dismiss if dragged far enough (more than 100px in any direction)
      if (Math.abs(newOffset.x) > 100 || Math.abs(newOffset.y) > 100) {
        handleClose();
      }
    },
    [isDragging, startPos.x, startPos.y, handleClose]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // If dragged less than 50px, snap back to original position
    if (Math.abs(dragOffset.x) < 50 && Math.abs(dragOffset.y) < 50) {
      setDragOffset({ x: 0, y: 0 });
    }
  }, [isDragging, dragOffset.x, dragOffset.y]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({
      x: touch.clientX - dragOffset.x,
      y: touch.clientY - dragOffset.y,
    });
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const newOffset = {
        x: touch.clientX - startPos.x,
        y: touch.clientY - startPos.y,
      };
      setDragOffset(newOffset);

      // Dismiss if dragged far enough (more than 100px in any direction)
      if (Math.abs(newOffset.x) > 100 || Math.abs(newOffset.y) > 100) {
        handleClose();
      }
    },
    [isDragging, startPos.x, startPos.y, handleClose]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // If dragged less than 50px, snap back to original position
    if (Math.abs(dragOffset.x) < 50 && Math.abs(dragOffset.y) < 50) {
      setDragOffset({ x: 0, y: 0 });
    }
  }, [isDragging, dragOffset.x, dragOffset.y]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  if (isDismissed) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed top-4 right-4 z-50 transition-all duration-500 ease-out ${isDragging ? 'transition-none' : ''
        } ${isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-2 opacity-0 scale-95 pointer-events-none'
        }`}
      style={{
        transform: isDragging
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
          : isVisible
            ? 'translateY(0px) scale(1)'
            : 'translateY(-8px) scale(0.95)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="bg-[#56A5F9] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:bg-sky-100 dark:text-sky-600 rounded-md px-4 py-3 max-w-sm select-none">
        <p className="text-sm font-semibold leading-tight text-center">
          {message}
        </p>
      </div>
    </div>
  );
}
