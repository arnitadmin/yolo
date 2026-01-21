"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Header } from "@/components/header";
import { AppDock } from "@/components/app-dock";
import { LoadRipple } from "@/components/ui/load-ripple";
import { Category } from "@/types";

export default function OnboardingPage() {
  const [markdownContent, setMarkdownContent] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch markdown content from API
        const contentResponse = await fetch("/api/content/onboarding");
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          setMarkdownContent(contentData.markdown);
        }

        // Fetch categories and role for dock
        const [catsRes, roleRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/user/role"),
        ]);

        if (catsRes.ok) {
          const catsData = await catsRes.json();
          setCategories(catsData);
        }

        if (roleRes.ok) {
          const roleData = await roleRes.json();
          setIsAdmin(roleData.isAdmin);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container pb-32 pt-8">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <LoadRipple />
          </div>
        ) : (
          <article className="prose prose-neutral dark:prose-invert mx-auto max-w-4xl">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-4xl font-bold mb-6 text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-3xl font-semibold mt-8 mb-4 text-foreground">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-2xl font-semibold mt-6 mb-3 text-foreground">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-lg leading-relaxed mb-4 text-foreground/90">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/90">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="text-lg leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                hr: () => <hr className="my-8 border-border" />,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </article>
        )}
      </main>

      <AppDock
        categories={categories}
        selectedCategory={null}
        onCategoryChange={() => {}}
        isAdmin={isAdmin}
      />
    </div>
  );
}
