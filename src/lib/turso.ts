import { createClient, type Client } from "@libsql/client";

let tursoClient: Client | null = null;

export function getTursoClient(): Client {
  if (tursoClient) {
    return tursoClient;
  }

  const dbUrl = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    throw new Error("DATABASE_URL and DATABASE_AUTH_TOKEN must be set");
  }

  tursoClient = createClient({
    url: dbUrl,
    authToken: authToken,
  });

  return tursoClient;
}

// Helper functions for common queries
export const turso = {
  // Applications
  async getApplications(category?: string) {
    const client = getTursoClient();
    const query = category
      ? "SELECT * FROM applications WHERE category = ? ORDER BY created_at DESC"
      : "SELECT * FROM applications ORDER BY created_at DESC";
    
    const result = category 
      ? await client.execute({ sql: query, args: [category] })
      : await client.execute(query);
    
    return result.rows;
  },

  async getApplicationById(id: number) {
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT * FROM applications WHERE id = ?",
      args: [id],
    });
    return result.rows[0] || null;
  },

  async createApplication(data: {
    name: string;
    description?: string;
    primaryUrl: string;
    secondaryUrl?: string;
    tags?: string;
    screenshotLightUrl?: string;
    screenshotDarkUrl?: string;
    category?: string;
    createdBy: string;
  }) {
    const client = getTursoClient();
    const result = await client.execute({
      sql: `INSERT INTO applications (name, description, primary_url, secondary_url, tags, screenshot_light_url, screenshot_dark_url, category, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        data.name,
        data.description || null,
        data.primaryUrl,
        data.secondaryUrl || null,
        data.tags || null,
        data.screenshotLightUrl || null,
        data.screenshotDarkUrl || null,
        data.category || null,
        data.createdBy,
      ],
    });
    return result.lastInsertRowid;
  },

  async updateApplication(id: number, data: Partial<{
    name: string;
    description: string;
    primaryUrl: string;
    secondaryUrl: string;
    tags: string;
    screenshotLightUrl: string;
    screenshotDarkUrl: string;
    category: string;
  }>) {
    const client = getTursoClient();
    const updates: string[] = [];
    const args: any[] = [];

    if (data.name !== undefined) { updates.push("name = ?"); args.push(data.name); }
    if (data.description !== undefined) { updates.push("description = ?"); args.push(data.description); }
    if (data.primaryUrl !== undefined) { updates.push("primary_url = ?"); args.push(data.primaryUrl); }
    if (data.secondaryUrl !== undefined) { updates.push("secondary_url = ?"); args.push(data.secondaryUrl); }
    if (data.tags !== undefined) { updates.push("tags = ?"); args.push(data.tags); }
    if (data.screenshotLightUrl !== undefined) { updates.push("screenshot_light_url = ?"); args.push(data.screenshotLightUrl); }
    if (data.screenshotDarkUrl !== undefined) { updates.push("screenshot_dark_url = ?"); args.push(data.screenshotDarkUrl); }
    if (data.category !== undefined) { updates.push("category = ?"); args.push(data.category); }

    updates.push("updated_at = datetime('now')");
    args.push(id);

    await client.execute({
      sql: `UPDATE applications SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });
  },

  async deleteApplication(id: number) {
    const client = getTursoClient();
    await client.execute({
      sql: "DELETE FROM applications WHERE id = ?",
      args: [id],
    });
  },

  // Categories
  async getCategories() {
    const client = getTursoClient();
    const result = await client.execute("SELECT * FROM categories ORDER BY name ASC");
    return result.rows;
  },

  async getCategoryById(id: number) {
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT * FROM categories WHERE id = ?",
      args: [id],
    });
    return result.rows[0] || null;
  },

  async createCategory(data: { name: string; icon?: string }) {
    const client = getTursoClient();
    const result = await client.execute({
      sql: `INSERT INTO categories (name, icon, created_at, updated_at)
            VALUES (?, ?, datetime('now'), datetime('now'))`,
      args: [data.name, data.icon || null],
    });
    return result.lastInsertRowid;
  },

  async updateCategory(id: number, data: { name?: string; icon?: string }) {
    const client = getTursoClient();
    const updates: string[] = [];
    const args: any[] = [];

    if (data.name !== undefined) { updates.push("name = ?"); args.push(data.name); }
    if (data.icon !== undefined) { updates.push("icon = ?"); args.push(data.icon); }

    updates.push("updated_at = datetime('now')");
    args.push(id);

    await client.execute({
      sql: `UPDATE categories SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });
  },

  async deleteCategory(id: number) {
    const client = getTursoClient();
    await client.execute({
      sql: "DELETE FROM categories WHERE id = ?",
      args: [id],
    });
  },
};

