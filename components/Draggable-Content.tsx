"use client";

import React, { useState, useEffect, useRef } from 'react';
import { DialogContent } from "@/components/ui/dialog";

// Custom DraggableDialog component
export const DraggableDialogContent = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogContent>) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | undefined>(undefined);
  const lastPosition = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  // Initialize dialog position to center of screen on mount
  useEffect(() => {
    if (dialogRef.current && typeof window !== "undefined") {
      const rect = dialogRef.current.getBoundingClientRect();
      const newPosition = {
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 4,
      };
      setPosition(newPosition);
      lastPosition.current = newPosition;
    }
  }, []);

      /* eslint-disable */


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only prevent dragging if clicking on interactive elements
    if (
      !(e.target as HTMLElement).closest('input, select, button, textarea, .form-item, .non-draggable')
    ) {
      setIsDragging(true);
      const rect = dialogRef.current?.getBoundingClientRect();
      if (rect) {
        setOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      // Cancel any ongoing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const updatePosition = (clientX: number, clientY: number) => {
    const newPosition = {
      x: clientX - offset.x,
      y: clientY - offset.y,
    };
    
    // Calculate velocity for momentum
    velocity.current = {
      x: newPosition.x - lastPosition.current.x,
      y: newPosition.y - lastPosition.current.y,
    };
    
    // Update position
    setPosition(newPosition);
    lastPosition.current = newPosition;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Use requestAnimationFrame for smoother updates
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(() => {
      updatePosition(e.clientX, e.clientY);
    });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Optional: Add momentum effect when releasing
    const applyMomentum = () => {
      // Reduce velocity gradually
      velocity.current.x *= 0.95;
      velocity.current.y *= 0.95;
      
      // Apply velocity to position
      const newPosition = {
        x: lastPosition.current.x + velocity.current.x,
        y: lastPosition.current.y + velocity.current.y,
      };
      
      setPosition(newPosition);
      lastPosition.current = newPosition;
      
      // Continue animation until velocity becomes very small
      if (Math.abs(velocity.current.x) > 0.1 || Math.abs(velocity.current.y) > 0.1) {
        animationRef.current = requestAnimationFrame(applyMomentum);
      }
    };
    
    // Apply momentum effect
    animationRef.current = requestAnimationFrame(applyMomentum);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseup", handleMouseUp);
      
      // Prevent text selection during drag
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      
      // Re-enable text selection
      document.body.style.userSelect = "";
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging]);

  return (
    <DialogContent
      ref={dialogRef}
      className={`bg-black-800 rounded-xl rounded-r-2xl md:h-p-[95%] lg:h-p-[90%] w-full absolute shadow-lg ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${className || ""}`}
      style={{
        position: "fixed",
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: "none",
        maxWidth: "90vw",
        width: "500px",
        margin: 0,
        transition: isDragging ? "none" : "transform 0.05s ease-out",
      }}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {children}
    </DialogContent>
  );
};