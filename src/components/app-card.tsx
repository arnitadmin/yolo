"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { GlowEffect } from "@/components/core/glow-effect";
import { Card } from "@/components/ui/card";
import { Application } from "@/types";
import Image from "next/image";
import { useTheme } from "@/components/theme-provider";

interface AppCardProps {
  application: Application;
}

export function AppCard({ application }: AppCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  const tags = application.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) || [];
  
  // Determine which screenshot to use based on theme
  const screenshotUrl = theme === "dark" 
    ? (application.screenshotDarkUrl || application.screenshotLightUrl)
    : (application.screenshotLightUrl || application.screenshotDarkUrl);

  return (
    <a
      href={application.primaryUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full">
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
        >
          <GlowEffect
            colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
            mode="colorShift"
            blur="medium"
            duration={4}
          />
        </motion.div>

        <Card className="relative flex h-full flex-col overflow-hidden border-border/40 bg-card transition-all hover:border-border p-3">
          {screenshotUrl && (
            <div className="relative w-full overflow-hidden rounded-md bg-muted" style={{ aspectRatio: "16/9" }}>
              <Image
                src={screenshotUrl}
                alt={application.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            </div>
          )}

          <div className="flex flex-1 flex-col gap-2 px-1 pb-1 pt-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {application.name}
              </h3>
              <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </div>

            {application.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {application.description}
              </p>
            )}

            <div className="mt-auto space-y-2">
              <p className="text-xs font-mono text-muted-foreground truncate">
                {application.primaryUrl}
              </p>

              {application.secondaryUrl && (
                <p className="text-xs text-muted-foreground">
                  Alt: {application.secondaryUrl}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </a>
  );
}

