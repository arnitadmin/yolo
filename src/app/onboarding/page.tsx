"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Header } from "@/components/header";
import { AppDock } from "@/components/app-dock";
import { LoadRipple } from "@/components/ui/load-ripple";
import { Mermaid } from "@/components/mermaid";
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
                code: ({ className, children }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const lang = match ? match[1] : "";
                  
                  // Handle mermaid code blocks
                  if (lang === "mermaid") {
                    return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                  }
                  
                  // Inline code
                  return (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => {
                  // Check if the child is a mermaid code block - if so, render without pre wrapper
                  const child = children as React.ReactElement<{ className?: string }>;
                  if (child?.props?.className?.includes("language-mermaid")) {
                    return <>{children}</>;
                  }
                  return (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                      {children}
                    </pre>
                  );
                },
                table: ({ children }) => (
                  <div className="my-6 overflow-x-auto">
                    <table className="w-full border-collapse border border-border rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted/50">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-border">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-muted/30 transition-colors">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 text-sm text-foreground/90">
                    {children}
                  </td>
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
