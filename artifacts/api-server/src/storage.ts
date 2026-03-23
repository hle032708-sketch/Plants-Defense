import { db, pool } from "@workspace/db";
import {
  users, mods, fusions, videos, categories, categoryItems, settings,
  type User, type InsertUser, type Mod, type InsertMod,
  type Fusion, type InsertFusion, type Video, type InsertVideo,
  type Category, type InsertCategory, type CategoryItem, type InsertCategoryItem,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export class Storage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: InsertUser & { role?: "ADMIN" | "USER" }): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async countUsers(): Promise<number> {
    const all = await db.select({ id: users.id }).from(users);
    return all.length;
  }

  async getMods(): Promise<Mod[]> {
    return db.select().from(mods).orderBy(desc(mods.createdAt));
  }

  async getMod(id: number): Promise<Mod | undefined> {
    const [mod] = await db.select().from(mods).where(eq(mods.id, id));
    return mod;
  }

  async createMod(data: InsertMod): Promise<Mod> {
    const [mod] = await db.insert(mods).values(data).returning();
    return mod;
  }

  async updateMod(id: number, data: Partial<InsertMod>): Promise<Mod> {
    const [mod] = await db.update(mods).set(data).where(eq(mods.id, id)).returning();
    return mod;
  }

  async deleteMod(id: number): Promise<void> {
    await db.delete(mods).where(eq(mods.id, id));
  }

  async getFusions(): Promise<Fusion[]> {
    return db.select().from(fusions).orderBy(desc(fusions.createdAt));
  }

  async getFusion(id: number): Promise<Fusion | undefined> {
    const [fusion] = await db.select().from(fusions).where(eq(fusions.id, id));
    return fusion;
  }

  async createFusion(data: InsertFusion): Promise<Fusion> {
    const [fusion] = await db.insert(fusions).values(data).returning();
    return fusion;
  }

  async updateFusion(id: number, data: Partial<InsertFusion>): Promise<Fusion> {
    const [fusion] = await db.update(fusions).set(data).where(eq(fusions.id, id)).returning();
    return fusion;
  }

  async deleteFusion(id: number): Promise<void> {
    await db.delete(fusions).where(eq(fusions.id, id));
  }

  async getVideos(): Promise<Video[]> {
    return db.select().from(videos).orderBy(desc(videos.createdAt));
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(data: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values(data).returning();
    return video;
  }

  async updateVideo(id: number, data: Partial<InsertVideo>): Promise<Video> {
    const [video] = await db.update(videos).set(data).where(eq(videos.id, id)).returning();
    return video;
  }

  async deleteVideo(id: number): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
    return cat;
  }

  async createCategory(data: InsertCategory): Promise<Category> {
    const [cat] = await db.insert(categories).values(data).returning();
    return cat;
  }

  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const [cat] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return cat;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getCategoryItems(categoryId: number): Promise<CategoryItem[]> {
    return db.select().from(categoryItems).where(eq(categoryItems.categoryId, categoryId)).orderBy(desc(categoryItems.createdAt));
  }

  async createCategoryItem(data: InsertCategoryItem): Promise<CategoryItem> {
    const [item] = await db.insert(categoryItems).values(data).returning();
    return item;
  }

  async updateCategoryItem(id: number, data: Partial<InsertCategoryItem>): Promise<CategoryItem | undefined> {
    const [item] = await db.update(categoryItems).set(data).where(eq(categoryItems.id, id)).returning();
    return item;
  }

  async deleteCategoryItem(id: number): Promise<void> {
    await db.delete(categoryItems).where(eq(categoryItems.id, id));
  }

  async getSetting(key: string): Promise<string | undefined> {
    const [s] = await db.select().from(settings).where(eq(settings.key, key));
    return s?.value;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await db.insert(settings).values({ key, value }).onConflictDoUpdate({
      target: settings.key,
      set: { value },
    });
  }

  async searchAll(q: string) {
    const lower = q.toLowerCase();
    const [allMods, allFusions, allVideos] = await Promise.all([
      this.getMods(),
      this.getFusions(),
      this.getVideos(),
    ]);
    return {
      mods: allMods.filter(m => m.title.toLowerCase().includes(lower) || m.description.toLowerCase().includes(lower)),
      fusions: allFusions.filter(f => f.name.toLowerCase().includes(lower) || f.recipe.toLowerCase().includes(lower)),
      videos: allVideos.filter(v => v.title.toLowerCase().includes(lower)),
    };
  }
}

export const storage = new Storage();
