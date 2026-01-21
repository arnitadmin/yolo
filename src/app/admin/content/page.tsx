"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadRipple } from "@/components/ui/load-ripple";

export default function AdminContentPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("onboarding");
  const [title, setTitle] = useState("Welcome to YOLO");
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  // Load existing content on mount
  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(`/api/content/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setTitle(data.title || "Welcome to YOLO");
          setMarkdown(data.markdown || "");
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setFetching(false);
      }
    }
    fetchContent();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, markdown }),
      });

      if (response.ok) {
        setMessage("✅ Content saved successfully!");
        setTimeout(() => router.push("/onboarding"), 1500);
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Manage Content</h1>

          {fetching ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <LoadRipple />
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="slug">Slug (unique identifier)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g., onboarding"
                disabled
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Cannot be changed after creation
              </p>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page title"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="markdown">Markdown Content</Label>
              <Textarea
                id="markdown"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Enter your markdown content here..."
                className="mt-2 min-h-96 font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Supports GitHub Flavored Markdown (GFM)
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${message.includes("✅") ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}`}>
                {message}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Content"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
          )}
        </div>
      </main>
    </div>
  );
}
