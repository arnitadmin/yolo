"use client";

import { UserButton } from "@clerk/nextjs";
import { Github, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { TextScramble } from "@/components/core/text-scramble";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="cursor-pointer">
            <h1 className="text-2xl font-bold">
              <TextScramble className="font-mono text-xl  tracking-wider">
                YOLO; you only link once
              </TextScramble>
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <div className="h-5 w-5" />
            )}
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/arnitadmin/yolo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}

