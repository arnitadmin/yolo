"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { GlowEffect } from "@/components/core/glow-effect";
import { Card } from "@/components/ui/card";
import { Application } from "@/types";
import Image from "next/image";

interface AppCardProps {
  application: Application;
}

export function AppCard({ application }: AppCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const tags = application.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) || [];

  return (
    <a
      href={application.primaryUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[280px] w-full">
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

        <Card className="relative flex h-full flex-col overflow-hidden border-border/40 bg-card transition-all hover:border-border">
          {application.screenshotUrl && (
            <div className="relative h-32 w-full overflow-hidden bg-muted">
              <Image
                src={application.screenshotUrl}
                alt={application.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex flex-1 flex-col gap-2 p-4">
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
              {application.secondaryUrl && (
                <p className="text-xs text-muted-foreground">
                  Alt: {application.secondaryUrl}
                </p>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </a>
  );
}

