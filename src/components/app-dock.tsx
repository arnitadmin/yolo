"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Settings } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/core/dock";
import { Category } from "@/types";

interface AppDockProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  isAdmin: boolean;
}

export function AppDock({
  categories,
  selectedCategory,
  onCategoryChange,
  isAdmin,
}: AppDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isOnAdminPage = pathname === "/admin";

  // Helper function to get icon component from Lucide
  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return null;
    return (LucideIcons as any)[iconName];
  };

  const handleCategoryClick = (categoryName: string | null) => {
    if (isOnAdminPage) {
      // Navigate to home page when on admin page
      router.push("/");
    } else {
      // Filter categories when on home page
      onCategoryChange(categoryName);
    }
  };

  // Determine active dock item based on selected category
  const getActiveDockItem = () => {
    if (selectedCategory === null) {
      return "all-apps";
    }
    const category = categories.find(c => c.name === selectedCategory);
    return category ? `category-${category.id}` : "all-apps";
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 max-w-full -translate-x-1/2">
      <Dock className="items-end pb-3" activeItem={getActiveDockItem()}>
        <DockItem
          id="all-apps"
          className="aspect-square cursor-pointer rounded-full bg-secondary"
          onClick={() => handleCategoryClick(null)}
        >
          <DockLabel>All Apps</DockLabel>
          <DockIcon className="scale-[0.6]">
            <Home className="h-full w-full text-foreground/60" />
          </DockIcon>
        </DockItem>

        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon);
          
          return (
            <DockItem
              key={category.id}
              id={`category-${category.id}`}
              className="aspect-square cursor-pointer rounded-full bg-secondary"
              onClick={() => handleCategoryClick(category.name)}
            >
              <DockLabel>{category.name}</DockLabel>
              <DockIcon className="scale-[0.6]">
                {IconComponent ? (
                  <IconComponent className="h-full w-full text-foreground/60" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-foreground/60">
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </DockIcon>
            </DockItem>
          );
        })}

        {isAdmin && !isOnAdminPage && (
          <DockItem
            id="admin-panel"
            className="aspect-square cursor-pointer rounded-full bg-secondary"
            onClick={() => router.push("/admin")}
          >
            <DockLabel>Admin Panel</DockLabel>
            <DockIcon className="scale-[0.6]">
              <Settings className="h-full w-full text-foreground/60" />
            </DockIcon>
          </DockItem>
        )}
      </Dock>
    </div>
  );
}

