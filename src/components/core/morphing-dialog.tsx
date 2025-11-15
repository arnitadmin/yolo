"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MorphingDialogContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  transition?: any;
}

const MorphingDialogContext = React.createContext<
  MorphingDialogContextValue | undefined
>(undefined);

function useMorphingDialog() {
  const context = React.useContext(MorphingDialogContext);
  if (!context) {
    throw new Error(
      "useMorphingDialog must be used within a MorphingDialog"
    );
  }
  return context;
}

interface MorphingDialogProps {
  children: React.ReactNode;
  transition?: any;
}

export function MorphingDialog({ children, transition }: MorphingDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <MorphingDialogContext.Provider value={{ isOpen, setIsOpen, transition }}>
      {children}
    </MorphingDialogContext.Provider>
  );
}

interface MorphingDialogTriggerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MorphingDialogTrigger({
  children,
  className,
  ...props
}: MorphingDialogTriggerProps) {
  const { setIsOpen } = useMorphingDialog();

  return (
    <div
      className={cn("cursor-pointer", className)}
      onClick={() => setIsOpen(true)}
      {...props}
    >
      {children}
    </div>
  );
}

interface MorphingDialogContainerProps {
  children: React.ReactNode;
}

export function MorphingDialogContainer({
  children,
}: MorphingDialogContainerProps) {
  const { isOpen, setIsOpen } = useMorphingDialog();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              {children}
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

interface MorphingDialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MorphingDialogContent({
  children,
  className,
  ...props
}: MorphingDialogContentProps) {
  const { transition } = useMorphingDialog();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={transition}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface MorphingDialogImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function MorphingDialogImage({
  className,
  ...props
}: MorphingDialogImageProps) {
  return <img className={cn(className)} {...props} />;
}

interface MorphingDialogTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function MorphingDialogTitle({
  children,
  className,
  ...props
}: MorphingDialogTitleProps) {
  return (
    <h3 className={cn("font-semibold", className)} {...props}>
      {children}
    </h3>
  );
}

interface MorphingDialogSubtitleProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function MorphingDialogSubtitle({
  children,
  className,
  ...props
}: MorphingDialogSubtitleProps) {
  return (
    <p className={cn("text-sm", className)} {...props}>
      {children}
    </p>
  );
}

interface MorphingDialogDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  disableLayoutAnimation?: boolean;
  variants?: any;
}

export function MorphingDialogDescription({
  children,
  className,
  disableLayoutAnimation,
  variants,
  ...props
}: MorphingDialogDescriptionProps) {
  return (
    <motion.div
      initial={variants?.initial}
      animate={variants?.animate}
      exit={variants?.exit}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface MorphingDialogCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function MorphingDialogClose({
  className,
  asChild = false,
  children,
  ...props
}: MorphingDialogCloseProps) {
  const { setIsOpen } = useMorphingDialog();

  if (asChild && children) {
    return (
      <div
        onClick={() => setIsOpen(false)}
        data-dialog-close
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsOpen(false)}
      data-dialog-close
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}

