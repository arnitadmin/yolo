"use client";

import { useEffect, useState } from "react";
import { 
  Plus, Pencil, Trash2, Plane, Rocket, Satellite, 
  Radio, Cpu, Wifi, Radar, CircuitBoard, Zap, 
  Sun, Battery, BatteryCharging, Fuel, Wind, Globe,
  Shield, ShieldCheck, Lock, Server, Database, Cloud
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Header } from "@/components/header";
import { AppDock } from "@/components/app-dock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Application, Category, ApplicationInput, CategoryInput } from "@/types";

const ICON_OPTIONS = [
  { name: "Plane", icon: Plane },
  { name: "Rocket", icon: Rocket },
  { name: "Satellite", icon: Satellite },
  { name: "Radio", icon: Radio },
  { name: "Cpu", icon: Cpu },
  { name: "Wifi", icon: Wifi },
  { name: "Radar", icon: Radar },
  { name: "CircuitBoard", icon: CircuitBoard },
  { name: "Zap", icon: Zap },
  { name: "Sun", icon: Sun },
  { name: "Battery", icon: Battery },
  { name: "BatteryCharging", icon: BatteryCharging },
  { name: "Fuel", icon: Fuel },
  { name: "Wind", icon: Wind },
  { name: "Globe", icon: Globe },
  { name: "Shield", icon: Shield },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Lock", icon: Lock },
  { name: "Server", icon: Server },
  { name: "Database", icon: Database },
  { name: "Cloud", icon: Cloud },
  { name: "Plus", icon: Plus },
  { name: "Pencil", icon: Pencil },
];

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [appDialogOpen, setAppDialogOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [deleteAppId, setDeleteAppId] = useState<number | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<number | null>(null);

  // Form states
  const [appForm, setAppForm] = useState<ApplicationInput>({
    name: "",
    description: "",
    primaryUrl: "",
    secondaryUrl: "",
    tags: "",
    screenshotLightUrl: "",
    screenshotDarkUrl: "",
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

  async function handleAppDelete() {
    if (deleteAppId === null) return;

    try {
      const res = await fetch(`/api/applications/${deleteAppId}`, {
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
    } finally {
      setDeleteAppId(null);
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

  async function handleCategoryDelete() {
    if (deleteCatId === null) return;

    try {
      const res = await fetch(`/api/categories/${deleteCatId}`, {
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
    } finally {
      setDeleteCatId(null);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, mode: 'light' | 'dark') {
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
        if (mode === 'light') {
          setAppForm({ ...appForm, screenshotLightUrl: data.url });
        } else {
          setAppForm({ ...appForm, screenshotDarkUrl: data.url });
        }
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
      screenshotLightUrl: "",
      screenshotDarkUrl: "",
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
        screenshotLightUrl: app.screenshotLightUrl || "",
        screenshotDarkUrl: app.screenshotDarkUrl || "",
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
                        <Select
                          value={appForm.category}
                          onValueChange={(value) =>
                            setAppForm({ ...appForm, category: value })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Screenshots</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="screenshot-light" className="text-sm text-muted-foreground">Light Mode</Label>
                            <div className="flex flex-col gap-2 mt-1">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("screenshot-light")?.click()}
                                disabled={uploading}
                                size="sm"
                              >
                                {uploading ? "Uploading..." : "Choose File"}
                              </Button>
                              <Input
                                id="screenshot-light"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'light')}
                                disabled={uploading}
                                className="hidden"
                              />
                              {appForm.screenshotLightUrl && (
                                <span className="text-xs text-muted-foreground">
                                  ✓ Light image uploaded
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="screenshot-dark" className="text-sm text-muted-foreground">Dark Mode</Label>
                            <div className="flex flex-col gap-2 mt-1">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("screenshot-dark")?.click()}
                                disabled={uploading}
                                size="sm"
                              >
                                {uploading ? "Uploading..." : "Choose File"}
                              </Button>
                              <Input
                                id="screenshot-dark"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'dark')}
                                disabled={uploading}
                                className="hidden"
                              />
                              {appForm.screenshotDarkUrl && (
                                <span className="text-xs text-muted-foreground">
                                  ✓ Dark image uploaded
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
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
                          onClick={() => setDeleteAppId(app.id)}
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
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Select from common icons:
                            </p>
                            <div className="grid grid-cols-6 gap-2">
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
                          </div>
                          <div>
                            <Label htmlFor="customIcon" className="text-sm text-muted-foreground">
                              Or enter custom icon name (e.g., Rocket, Package, Wrench)
                            </Label>
                            <Input
                              id="customIcon"
                              value={catForm.icon}
                              onChange={(e) =>
                                setCatForm({ ...catForm, icon: e.target.value })
                              }
                              placeholder="Enter Lucide icon name"
                              className="mt-1"
                            />
                          </div>
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
                  {categories.map((cat) => {
                    // Try to get icon from predefined list first, then from all Lucide icons
                    let IconComponent = cat.icon 
                      ? ICON_OPTIONS.find(opt => opt.name === cat.icon)?.icon 
                      : null;
                    
                    // If not in predefined list, try to get from all Lucide icons
                    if (!IconComponent && cat.icon) {
                      IconComponent = (LucideIcons as any)[cat.icon];
                    }
                    
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-3">
                          {IconComponent && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                              <IconComponent className="h-5 w-5" />
                            </div>
                          )}
                          <p className="font-medium">{cat.name}</p>
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
                            onClick={() => setDeleteCatId(cat.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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

      {/* Delete Application Confirmation */}
      <AlertDialog open={deleteAppId !== null} onOpenChange={(open) => !open && setDeleteAppId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the application
              and remove its data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAppDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={deleteCatId !== null} onOpenChange={(open) => !open && setDeleteCatId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              and remove its data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCategoryDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

