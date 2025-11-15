"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import Fuse from "fuse.js";
import { Header } from "@/components/header";
import { AppCard } from "@/components/app-card";
import { AppDock } from "@/components/app-dock";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadRipple } from "@/components/ui/load-ripple";
import { Application, Category } from "@/types";

export default function Home() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [appsRes, catsRes, roleRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/categories"),
          fetch("/api/user/role"),
        ]);

        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData);
        }

        if (catsRes.ok) {
          const catsData = await catsRes.json();
          setCategories(catsData);
        }

        if (roleRes.ok) {
          const roleData = await roleRes.json();
          console.log("Role data from API:", roleData);
          setIsAdmin(roleData.isAdmin);
        } else {
          console.error("Failed to fetch role:", roleRes.status);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Fuzzy search configuration
  const fuse = useMemo(() => {
    return new Fuse(applications, {
      keys: ["name", "description", "tags"],
      threshold: 0.3,
      includeScore: true,
    });
  }, [applications]);

  // Filter applications based on search and category
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Filter by access level - only show admin apps to admins
    filtered = filtered.filter((app) => {
      if (app.access === "admin") {
        return isAdmin;
      }
      return true;
    });

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((app) => app.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const results = fuse.search(searchQuery);
      const searchFiltered = results.map((result) => result.item);
      
      // Filter by access level in search results
      const accessFiltered = searchFiltered.filter((app) => {
        if (app.access === "admin") {
          return isAdmin;
        }
        return true;
      });
      
      // If category is selected, intersect the results
      if (selectedCategory) {
        return accessFiltered.filter((app) => app.category === selectedCategory);
      }
      
      return accessFiltered;
    }

    return filtered;
  }, [applications, selectedCategory, searchQuery, fuse, isAdmin]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container pb-32 pt-8">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="rounded-full"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                  className="rounded-full"
                >
                  {category.name}
                  {selectedCategory === category.name && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadRipple />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory
                ? "No applications found matching your criteria."
                : "No applications available. Add some from the admin panel!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredApplications.map((app) => (
              <AppCard key={app.id} application={app} />
            ))}
          </div>
        )}
      </main>

      <AppDock
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        isAdmin={isAdmin}
      />
    </div>
  );
}
