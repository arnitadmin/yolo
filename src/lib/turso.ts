import { createClient, type Client } from "@libsql/client";
import { Application, Category, Content } from "@/types";

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

// Helper function to map database row to Application type
function mapRowToApplication(row: any): Application {
  return {
    id: row.id as number,
    name: row.name as string,
    description: row.description as string | null,
    primaryUrl: row.primary_url as string,
    secondaryUrl: row.secondary_url as string | null,
    tags: row.tags as string | null,
    screenshotLightUrl: row.screenshot_light_url as string | null,
    screenshotDarkUrl: row.screenshot_dark_url as string | null,
    category: row.category as string | null,
    access: row.access as string,
    order: row.order as number,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    createdBy: row.created_by as string,
  };
}

// Helper function to map database row to Category type
function mapRowToCategory(row: any): Category {
  return {
    id: row.id as number,
    name: row.name as string,
    icon: row.icon as string | null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

// Helper function to map database row to Content type
function mapRowToContent(row: any): Content {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    markdown: row.markdown as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

// Helper functions for common queries
export const turso = {
  // Applications
  async getApplications(category?: string) {
    const client = getTursoClient();
    const query = category
      ? 'SELECT * FROM applications WHERE category = ? ORDER BY "order" ASC, created_at DESC'
      : 'SELECT * FROM applications ORDER BY "order" ASC, created_at DESC';
    
    const result = category 
      ? await client.execute({ sql: query, args: [category] })
      : await client.execute(query);
    
    return result.rows.map(mapRowToApplication);
  },

  async getApplicationById(id: number) {
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT * FROM applications WHERE id = ?",
      args: [id],
    });
    return result.rows[0] ? mapRowToApplication(result.rows[0]) : null;
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
    access?: string;
    order?: number;
    createdBy: string;
  }) {
    const client = getTursoClient();
    
    // If no order is provided, get the max order and add 1
    let order = data.order;
    if (order === undefined) {
      const maxOrderResult = await client.execute('SELECT MAX("order") as max_order FROM applications');
      const maxOrder = maxOrderResult.rows[0]?.max_order as number | null;
      order = (maxOrder || 0) + 1;
    }
    
    const result = await client.execute({
      sql: `INSERT INTO applications (name, description, primary_url, secondary_url, tags, screenshot_light_url, screenshot_dark_url, category, access, "order", created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        data.name,
        data.description || null,
        data.primaryUrl,
        data.secondaryUrl || null,
        data.tags || null,
        data.screenshotLightUrl || null,
        data.screenshotDarkUrl || null,
        data.category || null,
        data.access || "user",
        order,
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
    access: string;
    order: number;
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
    if (data.access !== undefined) { updates.push("access = ?"); args.push(data.access); }
    if (data.order !== undefined) { updates.push('"order" = ?'); args.push(data.order); }

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
    return result.rows.map(mapRowToCategory);
  },

  async getCategoryById(id: number) {
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT * FROM categories WHERE id = ?",
      args: [id],
    });
    return result.rows[0] ? mapRowToCategory(result.rows[0]) : null;
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

  // Content
  async getContentBySlug(slug: string): Promise<Content | null> {
    const client = getTursoClient();
    const result = await client.execute({
      sql: "SELECT * FROM contents WHERE slug = ?",
      args: [slug],
    });
    return result.rows[0] ? mapRowToContent(result.rows[0]) : null;
  },

  async getAllContent(): Promise<Content[]> {
    const client = getTursoClient();
    const result = await client.execute("SELECT * FROM contents ORDER BY created_at DESC");
    return result.rows.map(mapRowToContent);
  },

  async upsertContent(data: { slug: string; title: string; markdown: string }): Promise<Content> {
    const client = getTursoClient();
    
    // Check if content exists
    const existing = await client.execute({
      sql: "SELECT id FROM contents WHERE slug = ?",
      args: [data.slug],
    });

    if (existing.rows.length > 0) {
      // Update
      await client.execute({
        sql: "UPDATE contents SET title = ?, markdown = ?, updated_at = datetime('now') WHERE slug = ?",
        args: [data.title, data.markdown, data.slug],
      });
    } else {
      // Insert
      await client.execute({
        sql: "INSERT INTO contents (slug, title, markdown, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))",
        args: [data.slug, data.title, data.markdown],
      });
    }

    // Return the upserted content
    const result = await client.execute({
      sql: "SELECT * FROM contents WHERE slug = ?",
      args: [data.slug],
    });
    return mapRowToContent(result.rows[0]);
  },
};

