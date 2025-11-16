"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlowEffectProps {
  colors?: string[];
  mode?: "colorShift" | "static" | "borderAnimation";
  blur?: "small" | "medium" | "large";
  duration?: number;
  borderWidth?: number;
  theme?: "light" | "dark";
  className?: string;
}

// Helper function to get CSS variable colors
function getGlowColorsFromCSS(): string[] {
  if (typeof window === 'undefined') return ["#0894FF", "#C959DD", "#FF2E54", "#FF9004", "#10B981"];
  
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  return [
    computedStyle.getPropertyValue('--glow-1').trim(),
    computedStyle.getPropertyValue('--glow-2').trim(),
    computedStyle.getPropertyValue('--glow-3').trim(),
    computedStyle.getPropertyValue('--glow-4').trim(),
    computedStyle.getPropertyValue('--glow-5').trim(),
  ];
}

export function GlowEffect({
  colors,
  mode = "borderAnimation",
  blur = "medium",
  duration = 4,
  borderWidth = 2,
  theme = "dark",
  className,
}: GlowEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use CSS variables if colors not provided
  const effectiveColors = colors || getGlowColorsFromCSS();

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

      if (mode === "borderAnimation") {
        // Draw animated border with colors moving around the perimeter
        drawAnimatedBorder(ctx, rect.width, rect.height, effectiveColors, progress, borderWidth, theme);
      } else if (mode === "colorShift") {
        const colorIndex = Math.floor(progress * effectiveColors.length);
        const nextColorIndex = (colorIndex + 1) % effectiveColors.length;
        const colorProgress = (progress * effectiveColors.length) % 1;

        const currentColor = blendColors(effectiveColors[colorIndex], effectiveColors[nextColorIndex], colorProgress);
        
        // Fill entire area with semi-transparent color
        ctx.fillStyle = currentColor + '40'; // Add 40 for ~25% opacity
        ctx.fillRect(0, 0, rect.width, rect.height);
      } else if (mode === "static") {
        // Static mode: create radial gradients for each color
        drawStaticGlow(ctx, rect.width, rect.height, effectiveColors, theme);
      } else {
        // Use first color with opacity
        ctx.fillStyle = effectiveColors[0] + '40'; // Add 40 for ~25% opacity
        ctx.fillRect(0, 0, rect.width, rect.height);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, [effectiveColors, mode, duration, borderWidth, theme]);

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

function drawStaticGlow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  theme: "light" | "dark"
) {
  // Position colors evenly around the border perimeter
  // Calculate angle for each color to distribute them evenly
  const numColors = colors.length;
  const angleStep = (Math.PI * 2) / numColors;
  
  // Distance from center to place the glow (on the edges)
  const radiusX = width * 0.5;
  const radiusY = height * 0.5;
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  colors.forEach((color, index) => {
    // Calculate position on the border using circular distribution
    const angle = angleStep * index;
    const x = centerX + Math.cos(angle) * radiusX;
    const y = centerY + Math.sin(angle) * radiusY;
    
    const adjustedColor = adjustColorForTheme(color, theme);
    
    // Create radial gradient emanating from the border
    const gradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, Math.max(width, height) * 0.6
    );
    
    // Adjust opacity based on theme - darker mode gets reduced opacity
    const maxOpacity = theme === "dark" ? '99' : 'FF'; // 60% for dark, 100% for light
    const midOpacity = theme === "dark" ? '66' : 'CC'; // 40% for dark, 80% for light
    const lowOpacity = theme === "dark" ? '33' : '66'; // 20% for dark, 40% for light
    
    // Solid color at edge, fading to transparent toward center for blending
    gradient.addColorStop(0, adjustedColor + maxOpacity); // Max opacity at edge
    gradient.addColorStop(0.3, adjustedColor + midOpacity); // Mid opacity
    gradient.addColorStop(0.6, adjustedColor + lowOpacity); // Low opacity
    gradient.addColorStop(1, adjustedColor + '00'); // Transparent at center
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  });
}

function drawAnimatedBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  progress: number,
  borderWidth: number,
  theme: "light" | "dark"
) {
  // Calculate the perimeter
  const perimeter = 2 * (width + height);
  
  // Each color segment length
  const segmentLength = perimeter / colors.length;
  
  // Offset for animation (moves the colors around the border)
  const animationOffset = progress * perimeter;
  
  // Draw each color segment
  for (let i = 0; i < colors.length; i++) {
    const startPos = (i * segmentLength + animationOffset) % perimeter;
    const endPos = ((i + 1) * segmentLength + animationOffset) % perimeter;
    
    // Create gradient for this segment
    const gradient = createBorderGradient(ctx, width, height, startPos, endPos, colors[i], perimeter, theme);
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = borderWidth;
    
    // Draw the border segment
    drawBorderSegment(ctx, width, height, startPos, endPos, perimeter);
  }
}

function createBorderGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  startPos: number,
  endPos: number,
  color: string,
  perimeter: number,
  theme: "light" | "dark"
): CanvasGradient {
  // Get coordinates for start and end positions
  const start = getPositionOnBorder(width, height, startPos, perimeter);
  const end = getPositionOnBorder(width, height, endPos, perimeter);
  
  const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
  
  // Adjust color brightness based on theme
  const adjustedColor = adjustColorForTheme(color, theme);
  
  // Both modes use full opacity for maximum visibility
  const maxOpacity = "FF"; // FF = 100% opacity
  
  // Minimal transparency at edges for smooth blending - keep colors pronounced
  gradient.addColorStop(0, adjustedColor + '80');      // 50% opacity at start
  gradient.addColorStop(0.1, adjustedColor + maxOpacity);  // Full opacity quickly
  gradient.addColorStop(0.9, adjustedColor + maxOpacity);  // Full opacity until near end
  gradient.addColorStop(1, adjustedColor + '80');      // 50% opacity at end
  
  return gradient;
}

function getPositionOnBorder(
  width: number,
  height: number,
  position: number,
  perimeter: number
): { x: number; y: number } {
  const normalizedPos = position % perimeter;
  
  // Top edge
  if (normalizedPos < width) {
    return { x: normalizedPos, y: 0 };
  }
  // Right edge
  else if (normalizedPos < width + height) {
    return { x: width, y: normalizedPos - width };
  }
  // Bottom edge
  else if (normalizedPos < 2 * width + height) {
    return { x: width - (normalizedPos - width - height), y: height };
  }
  // Left edge
  else {
    return { x: 0, y: height - (normalizedPos - 2 * width - height) };
  }
}

function drawBorderSegment(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  startPos: number,
  endPos: number,
  perimeter: number
) {
  const start = getPositionOnBorder(width, height, startPos, perimeter);
  
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  
  // If the segment wraps around, we need to draw it in two parts
  if (endPos < startPos) {
    // Draw from start to end of perimeter
    drawBorderPath(ctx, width, height, startPos, perimeter, perimeter);
    // Draw from start of perimeter to end
    drawBorderPath(ctx, width, height, 0, endPos, perimeter);
  } else {
    // Draw normally
    drawBorderPath(ctx, width, height, startPos, endPos, perimeter);
  }
  
  ctx.stroke();
}

function drawBorderPath(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  startPos: number,
  endPos: number,
  perimeter: number
) {
  const steps = Math.ceil((endPos - startPos) / 2); // Draw smooth path
  
  for (let i = 0; i <= steps; i++) {
    const pos = startPos + (i / steps) * (endPos - startPos);
    const point = getPositionOnBorder(width, height, pos, perimeter);
    ctx.lineTo(point.x, point.y);
  }
}

function adjustColorForTheme(color: string, theme: "light" | "dark"): string {
  // No artificial color adjustment - use colors as defined in CSS variables
  // Users can set appropriate colors for each theme in globals.css
  return color;
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

