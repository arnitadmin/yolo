"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Settings, User } from "lucide-react";
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
  onCategoryChange,
  isAdmin,
}: AppDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isOnAdminPage = pathname === "/admin";

  const iconMap: Record<string, React.ReactNode> = {
    Home: <Home className="h-full w-full text-foreground/60" />,
    Settings: <Settings className="h-full w-full text-foreground/60" />,
    User: <User className="h-full w-full text-foreground/60" />,
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

  return (
    <div className="fixed bottom-4 left-1/2 z-50 max-w-full -translate-x-1/2">
      <Dock className="items-end pb-3">
        <DockItem
          className="aspect-square cursor-pointer rounded-full bg-secondary"
          onClick={() => handleCategoryClick(null)}
        >
          <DockLabel>All Apps</DockLabel>
          <DockIcon>
            <Home className="h-full w-full text-foreground/60" />
          </DockIcon>
        </DockItem>

        {categories.map((category) => (
          <DockItem
            key={category.id}
            className="aspect-square cursor-pointer rounded-full bg-secondary"
            onClick={() => handleCategoryClick(category.name)}
          >
            <DockLabel>{category.name}</DockLabel>
            <DockIcon>
              {category.icon && iconMap[category.icon] ? (
                iconMap[category.icon]
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-foreground/60">
                  {category.name.charAt(0).toUpperCase()}
                </div>
              )}
            </DockIcon>
          </DockItem>
        ))}

        {isAdmin && (
          <DockItem
            className="aspect-square cursor-pointer rounded-full bg-secondary"
            onClick={() => {
              if (isOnAdminPage) {
                router.push("/");
              } else {
                router.push("/admin");
              }
            }}
          >
            <DockLabel>{isOnAdminPage ? "Home" : "Admin Panel"}</DockLabel>
            <DockIcon>
              {isOnAdminPage ? (
                <Home className="h-full w-full text-foreground/60" />
              ) : (
                <Settings className="h-full w-full text-foreground/60" />
              )}
            </DockIcon>
          </DockItem>
        )}

        <DockItem className="aspect-square cursor-pointer rounded-full bg-secondary">
          <DockLabel>Profile</DockLabel>
          <DockIcon>
            <User className="h-full w-full text-foreground/60" />
          </DockIcon>
        </DockItem>
      </Dock>
    </div>
  );
}

