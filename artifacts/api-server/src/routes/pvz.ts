import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express } from "express";
import { storage } from "../storage";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── Auth middleware ──
function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}

function requireAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && (req.user as any)?.role === "ADMIN") return next();
  res.status(403).json({ message: "Forbidden" });
}

// ── Auth routes ──
router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    const u = req.user as any;
    res.json({ id: u.id, email: u.email, role: u.role });
  } else {
    res.json(null);
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info?.message ?? "Invalid credentials" });
    req.login(user, (err2) => {
      if (err2) return next(err2);
      res.json({ id: user.id, email: user.email, role: user.role });
    });
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  req.logout(() => {});
  res.json({ ok: true });
});

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
    const existing = await storage.getUserByEmail(email);
    if (existing) return res.status(409).json({ message: "Email này đã được sử dụng" });
    const count = await storage.countUsers();
    const role = count === 0 ? "ADMIN" : "USER";
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({ email, password: hashedPassword, role });
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json({ id: user.id, email: user.email, role: user.role });
    });
  } catch (err) {
    next(err);
  }
});

// ── File upload ──
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage: uploadStorage, limits: { fileSize: 100 * 1024 * 1024 } });

router.post("/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `/api/uploads/${req.file.filename}` });
});

// ── Mods ──
router.get("/mods", async (req, res, next) => {
  try {
    res.json(await storage.getMods());
  } catch (err) { next(err); }
});

router.get("/mods/:id", async (req, res, next) => {
  try {
    const mod = await storage.getMod(Number(req.params.id));
    if (!mod) return res.status(404).json({ message: "Not found" });
    res.json(mod);
  } catch (err) { next(err); }
});

router.post("/mods", requireAdmin, async (req, res, next) => {
  try {
    const mod = await storage.createMod(req.body);
    res.status(201).json(mod);
  } catch (err) { next(err); }
});

router.put("/mods/:id", requireAdmin, async (req, res, next) => {
  try {
    const mod = await storage.updateMod(Number(req.params.id), req.body);
    res.json(mod);
  } catch (err) { next(err); }
});

router.delete("/mods/:id", requireAdmin, async (req, res, next) => {
  try {
    await storage.deleteMod(Number(req.params.id));
    res.status(204).end();
  } catch (err) { next(err); }
});

// ── Fusions ──
router.get("/fusions", async (req, res, next) => {
  try {
    res.json(await storage.getFusions());
  } catch (err) { next(err); }
});

router.get("/fusions/:id", async (req, res, next) => {
  try {
    const fusion = await storage.getFusion(Number(req.params.id));
    if (!fusion) return res.status(404).json({ message: "Not found" });
    res.json(fusion);
  } catch (err) { next(err); }
});

router.post("/fusions", requireAdmin, async (req, res, next) => {
  try {
    const fusion = await storage.createFusion(req.body);
    res.status(201).json(fusion);
  } catch (err) { next(err); }
});

router.put("/fusions/:id", requireAdmin, async (req, res, next) => {
  try {
    const fusion = await storage.updateFusion(Number(req.params.id), req.body);
    res.json(fusion);
  } catch (err) { next(err); }
});

router.delete("/fusions/:id", requireAdmin, async (req, res, next) => {
  try {
    await storage.deleteFusion(Number(req.params.id));
    res.status(204).end();
  } catch (err) { next(err); }
});

// ── Videos ──
router.get("/videos", async (req, res, next) => {
  try {
    res.json(await storage.getVideos());
  } catch (err) { next(err); }
});

router.get("/videos/:id", async (req, res, next) => {
  try {
    const video = await storage.getVideo(Number(req.params.id));
    if (!video) return res.status(404).json({ message: "Not found" });
    res.json(video);
  } catch (err) { next(err); }
});

router.post("/videos", requireAdmin, async (req, res, next) => {
  try {
    const video = await storage.createVideo(req.body);
    res.status(201).json(video);
  } catch (err) { next(err); }
});

router.put("/videos/:id", requireAdmin, async (req, res, next) => {
  try {
    const video = await storage.updateVideo(Number(req.params.id), req.body);
    res.json(video);
  } catch (err) { next(err); }
});

router.delete("/videos/:id", requireAdmin, async (req, res, next) => {
  try {
    await storage.deleteVideo(Number(req.params.id));
    res.status(204).end();
  } catch (err) { next(err); }
});

// ── Categories ──
router.get("/categories", async (req, res, next) => {
  try {
    res.json(await storage.getCategories());
  } catch (err) { next(err); }
});

router.get("/categories/:id/items", async (req, res, next) => {
  try {
    res.json(await storage.getCategoryItems(Number(req.params.id)));
  } catch (err) { next(err); }
});

router.post("/categories", requireAdmin, async (req, res, next) => {
  try {
    const cat = await storage.createCategory(req.body);
    res.status(201).json(cat);
  } catch (err) { next(err); }
});

router.put("/categories/:id", requireAdmin, async (req, res, next) => {
  try {
    const cat = await storage.updateCategory(Number(req.params.id), req.body);
    res.json(cat);
  } catch (err) { next(err); }
});

router.delete("/categories/:id", requireAdmin, async (req, res, next) => {
  try {
    await storage.deleteCategory(Number(req.params.id));
    res.status(204).end();
  } catch (err) { next(err); }
});

router.post("/categories/:id/items", requireAdmin, async (req, res, next) => {
  try {
    const item = await storage.createCategoryItem({ ...req.body, categoryId: Number(req.params.id) });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

router.put("/category-items/:id", requireAdmin, async (req, res, next) => {
  try {
    const item = await storage.updateCategoryItem(Number(req.params.id), req.body);
    res.json(item);
  } catch (err) { next(err); }
});

router.delete("/category-items/:id", requireAdmin, async (req, res, next) => {
  try {
    await storage.deleteCategoryItem(Number(req.params.id));
    res.status(204).end();
  } catch (err) { next(err); }
});

// ── Settings ──
router.get("/settings/:key", async (req, res, next) => {
  try {
    const value = await storage.getSetting(req.params.key);
    if (value === undefined) return res.status(404).json({ message: "Not found" });
    res.json({ key: req.params.key, value });
  } catch (err) { next(err); }
});

router.post("/settings/:key", requireAdmin, async (req, res, next) => {
  try {
    await storage.setSetting(req.params.key, req.body.value);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Search ──
router.get("/search", async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "");
    if (!q) return res.json({ mods: [], fusions: [], videos: [] });
    res.json(await storage.searchAll(q));
  } catch (err) { next(err); }
});

export function setupAuth(app: Express, sessionStore: any) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) return done(null, false, { message: "Email không tồn tại" });
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return done(null, false, { message: "Mật khẩu không đúng" });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? "pvz-fusion-secret-key-2025",
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
}

export default router;
