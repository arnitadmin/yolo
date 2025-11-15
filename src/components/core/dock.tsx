"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface DockProps {
  children: React.ReactNode;
  className?: string;
}

interface DockItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface DockIconProps {
  children: React.ReactNode;
  className?: string;
}

interface DockLabelProps {
  children: React.ReactNode;
  className?: string;
}

const DockContext = React.createContext<{
  mouseX: ReturnType<typeof useMotionValue<number>>;
} | null>(null);

export function Dock({ children, className }: DockProps) {
  const mouseX = useMotionValue<number>(Infinity);

  return (
    <DockContext.Provider value={{ mouseX }}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          "mx-auto flex h-16 items-end gap-4 rounded-2xl border border-border bg-background/80 px-4 pb-3 backdrop-blur-md",
          className
        )}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

export function DockItem({ children, className, onClick }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const context = React.useContext(DockContext);

  if (!context) {
    throw new Error("DockItem must be used within a Dock");
  }

  const { mouseX } = context;

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const [showLabel, setShowLabel] = useState(false);

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      onClick={onClick}
      className={cn("relative flex aspect-square w-10 items-center justify-center", className)}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DockLabel) {
            return React.cloneElement(child as React.ReactElement<{ show: boolean }>, {
              show: showLabel,
            });
          }
          return child;
        }
        return child;
      })}
    </motion.div>
  );
}

export function DockIcon({ children, className }: DockIconProps) {
  return (
    <div className={cn("flex h-full w-full items-center justify-center", className)}>
      {children}
    </div>
  );
}

export function DockLabel({
  children,
  className,
  show,
}: DockLabelProps & { show?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: show ? 1 : 0, y: show ? -40 : 10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "absolute bottom-full mb-2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

