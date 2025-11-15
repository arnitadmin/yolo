"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TextScrambleProps {
  children: string;
  className?: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
}

export function TextScramble({
  children,
  className,
  characterSet = "!<>-_\\/[]{}—=+*^?#________",
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(children);
  const frameRef = useRef(0);
  const hasScrambledRef = useRef(false);

  useEffect(() => {
    // Only scramble once on mount
    if (hasScrambledRef.current) return;
    hasScrambledRef.current = true;

    const scramble = () => {
      const length = children.length;
      const queue: Array<{ from: string; to: string; start: number; end: number }> = [];

      for (let i = 0; i < length; i++) {
        const from = "";
        const to = children[i];
        const start = Math.floor(Math.random() * 60);
        const end = start + Math.floor(Math.random() * 90);
        queue.push({ from, to, start, end });
      }

      let frame = 0;
      const animate = () => {
        let output = "";
        let complete = 0;

        for (let i = 0; i < queue.length; i++) {
          const { from, to, start, end } = queue[i];

          if (frame >= end) {
            complete++;
            output += to;
          } else if (frame >= start) {
            if (!to || Math.random() < 0.28) {
              output += characterSet[Math.floor(Math.random() * characterSet.length)];
            } else {
              output += to;
            }
          } else {
            output += from;
          }
        }

        setDisplayText(output);

        if (complete === queue.length) {
          cancelAnimationFrame(frameRef.current);
        } else {
          frameRef.current = requestAnimationFrame(animate);
          frame++;
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    };

    scramble();

    return () => {
      cancelAnimationFrame(frameRef.current);
      hasScrambledRef.current = false;
    };
  }, [children, characterSet]);

  return <span className={cn(className)}>{displayText}</span>;
}

