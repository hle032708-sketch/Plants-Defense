import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("user_role", ["ADMIN", "USER"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("USER"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mods = pgTable("mods", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  version: text("version").notNull(),
  description: text("description").notNull(),
  changelog: text("changelog"),
  imageUrl: text("image_url").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fusions = pgTable("fusions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  recipe: text("recipe").notNull(),
  ability: text("ability").notNull(),
  imageUrl: text("image_url").notNull(),
  fileUrl: text("file_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  downloadUrl: text("download_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
});

export const categoryItems = pgTable("category_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServerSchema = createInsertSchema(servers).omit({ id: true, createdAt: true });

export type Server = typeof servers.$inferSelect;
export type InsertServer = z.infer<typeof insertServerSchema>;

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertModSchema = createInsertSchema(mods).omit({ id: true, createdAt: true });
export const insertFusionSchema = createInsertSchema(fusions).omit({ id: true, createdAt: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertCategoryItemSchema = createInsertSchema(categoryItems).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type Mod = typeof mods.$inferSelect;
export type Fusion = typeof fusions.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type CategoryItem = typeof categoryItems.$inferSelect;
export type Setting = typeof settings.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMod = z.infer<typeof insertModSchema>;
export type InsertFusion = z.infer<typeof insertFusionSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertCategoryItem = z.infer<typeof insertCategoryItemSchema>;
