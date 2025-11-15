"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlowEffectProps {
  colors?: string[];
  mode?: "colorShift" | "static";
  blur?: "small" | "medium" | "large";
  duration?: number;
  className?: string;
}

export function GlowEffect({
  colors = ["#0894FF", "#C959DD", "#FF2E54", "#FF9004"],
  mode = "colorShift",
  blur = "medium",
  duration = 4,
  className,
}: GlowEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationFrame: number;
    const startTime = Date.now();

    const animate = () => {
      if (!ctx || !canvas) return;

      const elapsed = (Date.now() - startTime) / 1000;
      const progress = (elapsed % duration) / duration;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rect = canvas.getBoundingClientRect();

      if (mode === "colorShift") {
        const colorIndex = Math.floor(progress * colors.length);
        const nextColorIndex = (colorIndex + 1) % colors.length;
        const colorProgress = (progress * colors.length) % 1;

        const currentColor = blendColors(colors[colorIndex], colors[nextColorIndex], colorProgress);
        
        // Fill entire area with semi-transparent color
        ctx.fillStyle = currentColor + '40'; // Add 40 for ~25% opacity
        ctx.fillRect(0, 0, rect.width, rect.height);
      } else {
        // Use first color with opacity
        ctx.fillStyle = colors[0] + '40'; // Add 40 for ~25% opacity
        ctx.fillRect(0, 0, rect.width, rect.height);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, [colors, mode, duration]);

  const blurClass = {
    small: "blur-sm",
    medium: "blur-md",
    large: "blur-lg",
  }[blur];

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 h-full w-full", blurClass, className)}
    />
  );
}

function blendColors(color1: string, color2: string, ratio: number): string {
  const hex1 = color1.replace("#", "");
  const hex2 = color2.replace("#", "");

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

