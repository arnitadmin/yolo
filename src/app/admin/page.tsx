"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Pencil, Trash2, Upload, Home, Settings, User, 
  Folder, FileText, Code, Database, Cloud, Mail, 
  Calendar, Clock, Image, Video, Music, Book,
  ShoppingCart, Heart, Star, Zap, Check
} from "lucide-react";
import { Header } from "@/components/header";
import { AppDock } from "@/components/app-dock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Application, Category, ApplicationInput, CategoryInput } from "@/types";

const ICON_OPTIONS = [
  { name: "Home", icon: Home },
  { name: "Settings", icon: Settings },
  { name: "User", icon: User },
  { name: "Folder", icon: Folder },
  { name: "FileText", icon: FileText },
  { name: "Code", icon: Code },
  { name: "Database", icon: Database },
  { name: "Cloud", icon: Cloud },
  { name: "Mail", icon: Mail },
  { name: "Calendar", icon: Calendar },
  { name: "Clock", icon: Clock },
  { name: "Image", icon: Image },
  { name: "Video", icon: Video },
  { name: "Music", icon: Music },
  { name: "Book", icon: Book },
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "Heart", icon: Heart },
  { name: "Star", icon: Star },
  { name: "Zap", icon: Zap },
  { name: "Check", icon: Check },
];

export default function AdminPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [appDialogOpen, setAppDialogOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Form states
  const [appForm, setAppForm] = useState<ApplicationInput>({
    name: "",
    description: "",
    primaryUrl: "",
    secondaryUrl: "",
    tags: "",
    screenshotUrl: "",
    category: "",
  });

  const [catForm, setCatForm] = useState<CategoryInput>({
    name: "",
    icon: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [appsRes, catsRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/categories"),
      ]);

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }

      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategories(catsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAppSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingApp
        ? `/api/applications/${editingApp.id}`
        : "/api/applications";
      const method = editingApp ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appForm),
      });

      if (res.ok) {
        setAppDialogOpen(false);
        resetAppForm();
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save application");
      }
    } catch (error) {
      console.error("Error saving application:", error);
      alert("Failed to save application");
    }
  }

  async function handleAppDelete(id: number) {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete application");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Failed to delete application");
    }
  }

  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingCat
        ? `/api/categories/${editingCat.id}`
        : "/api/categories";
      const method = editingCat ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catForm),
      });

      if (res.ok) {
        setCatDialogOpen(false);
        resetCatForm();
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    }
  }

  async function handleCategoryDelete(id: number) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAppForm({ ...appForm, screenshotUrl: data.url });
      } else {
        const error = await res.json();
        alert(error.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  function resetAppForm() {
    setAppForm({
      name: "",
      description: "",
      primaryUrl: "",
      secondaryUrl: "",
      tags: "",
      screenshotUrl: "",
      category: "",
    });
    setEditingApp(null);
  }

  function resetCatForm() {
    setCatForm({
      name: "",
      icon: "",
    });
    setEditingCat(null);
  }

  function openAppDialog(app?: Application) {
    if (app) {
      setEditingApp(app);
      setAppForm({
        name: app.name,
        description: app.description || "",
        primaryUrl: app.primaryUrl,
        secondaryUrl: app.secondaryUrl || "",
        tags: app.tags || "",
        screenshotUrl: app.screenshotUrl || "",
        category: app.category || "",
      });
    } else {
      resetAppForm();
    }
    setAppDialogOpen(true);
  }

  function openCatDialog(cat?: Category) {
    if (cat) {
      setEditingCat(cat);
      setCatForm({
        name: cat.name,
        icon: cat.icon || "",
      });
    } else {
      resetCatForm();
    }
    setCatDialogOpen(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container pb-32 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage applications and categories
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Applications Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Applications</CardTitle>
                  <CardDescription>
                    Manage your organization&apos;s applications
                  </CardDescription>
                </div>
                <Dialog open={appDialogOpen} onOpenChange={setAppDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openAppDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add App
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingApp ? "Edit Application" : "Add Application"}
                      </DialogTitle>
                      <DialogDescription>
                        Fill in the details for the application
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAppSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={appForm.name}
                          onChange={(e) =>
                            setAppForm({ ...appForm, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={appForm.description}
                          onChange={(e) =>
                            setAppForm({
                              ...appForm,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primaryUrl">Primary URL *</Label>
                        <Input
                          id="primaryUrl"
                          type="url"
                          value={appForm.primaryUrl}
                          onChange={(e) =>
                            setAppForm({ ...appForm, primaryUrl: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondaryUrl">Secondary URL</Label>
                        <Input
                          id="secondaryUrl"
                          type="url"
                          value={appForm.secondaryUrl}
                          onChange={(e) =>
                            setAppForm({
                              ...appForm,
                              secondaryUrl: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          value={appForm.tags}
                          onChange={(e) =>
                            setAppForm({ ...appForm, tags: e.target.value })
                          }
                          placeholder="ai, chatbot, productivity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={appForm.category}
                          onChange={(e) =>
                            setAppForm({ ...appForm, category: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="screenshot">Screenshot</Label>
                        <div className="flex gap-2">
                          <Input
                            id="screenshot"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                          {uploading && <span>Uploading...</span>}
                        </div>
                        {appForm.screenshotUrl && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Image uploaded successfully
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">
                          {editingApp ? "Update" : "Create"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAppDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : applications.length === 0 ? (
                <p className="text-muted-foreground">No applications yet</p>
              ) : (
                <div className="space-y-2">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium">{app.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.primaryUrl}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openAppDialog(app)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleAppDelete(app.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    Manage application categories
                  </CardDescription>
                </div>
                <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openCatDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCat ? "Edit Category" : "Add Category"}
                      </DialogTitle>
                      <DialogDescription>
                        Fill in the details for the category
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="catName">Name *</Label>
                        <Input
                          id="catName"
                          value={catForm.name}
                          onChange={(e) =>
                            setCatForm({ ...catForm, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <div className="grid grid-cols-5 gap-2">
                          {ICON_OPTIONS.map((option) => {
                            const IconComponent = option.icon;
                            return (
                              <button
                                key={option.name}
                                type="button"
                                onClick={() =>
                                  setCatForm({ ...catForm, icon: option.name })
                                }
                                className={`flex aspect-square items-center justify-center rounded-lg border-2 transition-colors hover:bg-accent ${
                                  catForm.icon === option.name
                                    ? "border-primary bg-accent"
                                    : "border-border"
                                }`}
                              >
                                <IconComponent className="h-5 w-5" />
                              </button>
                            );
                          })}
                        </div>
                        {catForm.icon && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Selected: {catForm.icon}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">
                          {editingCat ? "Update" : "Create"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCatDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : categories.length === 0 ? (
                <p className="text-muted-foreground">No categories yet</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        {cat.icon && (
                          <p className="text-sm text-muted-foreground">
                            Icon: {cat.icon}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openCatDialog(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCategoryDelete(cat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AppDock
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        isAdmin={true}
      />
    </div>
  );
}

