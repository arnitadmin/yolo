"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextMorphProps {
  children: React.ReactNode;
  className?: string;
}

export function TextMorph({ children, className }: TextMorphProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [children]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn("inline-block", className)}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

