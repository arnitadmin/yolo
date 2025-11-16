"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlusIcon, X } from "lucide-react";
import { GlowEffect } from "@/components/core/glow-effect";
import { Card } from "@/components/ui/card";
import { Application } from "@/types";
import Image from "next/image";
import { useTheme } from "@/components/theme-provider";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
} from "@/components/core/morphing-dialog";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

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
    <MorphingDialog
      transition={{
        type: "spring",
        bounce: 0.05,
        duration: 0.25,
      }}
    >
      <div
        className="relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
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
            mode="static"
            blur="small"
            theme={theme === "system" ? "dark" : theme}
          />
        </motion.div>

        <MorphingDialogTrigger
          style={{
            borderRadius: "0.75rem",
          }}
          className="flex w-full flex-col overflow-hidden"
        >
          <Card className="relative flex h-full flex-col overflow-hidden border-border/40 bg-card transition-all hover:border-border p-3 shadow-none">
            <div className="relative w-full overflow-hidden rounded-md" style={{ aspectRatio: "16/9" }}>
              {screenshotUrl ? (
                <Image
                  src={screenshotUrl}
                  alt={application.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-muted/30" />
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2 px-1 pb-1 pt-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {application.name}
                </h3>
                <button
                  type="button"
                  className="relative ml-1 flex h-6 w-6 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
                  aria-label="Open dialog"
                >
                  <PlusIcon size={12} />
                </button>
              </div>

              <div className="mt-auto">
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {application.primaryUrl}
                </p>
              </div>
            </div>
          </Card>
        </MorphingDialogTrigger>
      </div>

      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{
            borderRadius: "24px",
          }}
          className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-border bg-card sm:w-[500px]"
        >
          <div className="p-4">
            {screenshotUrl && (
              <MorphingDialogImage
                src={screenshotUrl}
                alt={application.name}
                className="h-full w-full rounded-lg object-cover"
              />
            )}
          </div>
          <div className="px-6 pb-6">
            {tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <MorphingDialogTitle className="text-2xl text-foreground">
              {application.name}
            </MorphingDialogTitle>
            {application.category && (
              <MorphingDialogSubtitle className="text-muted-foreground">
                {application.category}
              </MorphingDialogSubtitle>
            )}
            <MorphingDialogDescription
              disableLayoutAnimation
              variants={{
                initial: { opacity: 0, scale: 0.8, y: 100 },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.8, y: 100 },
              }}
            >
              {application.description && (
                <p className="mt-2 text-muted-foreground/70">
                  {application.description}
                </p>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-muted-foreground/60 whitespace-nowrap">Primary Link:</p>
                  <a
                    href={application.primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-muted-foreground/70 hover:text-primary transition-colors break-all"
                  >
                    {application.primaryUrl}
                  </a>
                </div>
                
                {application.secondaryUrl && (
                  <div className="flex items-baseline gap-2">
                    <p className="text-xs text-muted-foreground/60 whitespace-nowrap">Alt Link:</p>
                    <a
                      href={application.secondaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-muted-foreground/70 hover:text-primary transition-colors break-all"
                    >
                      {application.secondaryUrl}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <MorphingDialogClose asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-full border border-input bg-background px-6 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Close
                  </button>
                </MorphingDialogClose>
                
                <a
                  href={application.primaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <InteractiveHoverButton
                    text="Go to Link"
                    className="w-full"
                  />
                </a>
              </div>
            </MorphingDialogDescription>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

