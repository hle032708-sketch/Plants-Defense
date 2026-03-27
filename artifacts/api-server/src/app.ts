import express, { type Express, Request, Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import router from "./routes";
import pvzRouter, { setupAuth } from "./routes/pvz";
import { storage } from "./storage";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: Request) {
        return {
          id: (req as any).id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: Response) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Setup auth (session + passport)
setupAuth(app, storage.sessionStore);

// Serve uploaded files
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/api/uploads", express.static(uploadDir));

app.use("/api", router);
app.use("/api", pvzRouter);

// Seed database on startup
async function seedDatabase() {
  try {
    const existingMods = await storage.getMods();
    if (existingMods.length === 0) {
      await storage.createMod({
        title: "PvZ Fusion Mod",
        version: "2.1.0",
        description: "Bản mod PvZ Fusion với bộ sưu tập kết hợp thực vật và zombie độc đáo, cùng với nhiều tính năng mới hấp dẫn.",
        changelog: "- Thêm các fusion mới\n- Cân bằng gameplay\n- Cải thiện giao diện\n- Sửa nhiều lỗi nhỏ",
        imageUrl: "https://placehold.co/1200x630/166534/FFFFFF?text=PvZ+Fusion+Mod+2.1",
        fileUrl: "#",
      });
      await storage.createMod({
        title: "PvZ Fusion Mod",
        version: "2.0.0",
        description: "Phiên bản lớn với nhiều cải tiến đáng kể và thêm hàng chục fusion mới vào FusionDex.",
        changelog: "- Ra mắt FusionDex\n- Thêm 30+ fusion mới\n- Hệ thống admin panel\n- Upload ảnh và file",
        imageUrl: "https://placehold.co/1200x630/14532D/FFFFFF?text=PvZ+Fusion+Mod+2.0",
        fileUrl: "#",
      });
    }

    const existingFusions = await storage.getFusions();
    if (existingFusions.length === 0) {
      const fusionData = [
        { name: "Pea-nut", type: "Plant", recipe: "Peashooter + Wall-nut", ability: "Bắn đậu liên tục trong khi cung cấp khả năng phòng thủ vững chắc ở tuyến trước.", imageUrl: "https://placehold.co/640x640/166534/FFFFFF?text=Pea-nut" },
        { name: "Sun-shroom", type: "Plant", recipe: "Sunflower + Puff-shroom", ability: "Tạo ra mặt trời và có thể đâm các kẻ thù gần đó vào ban đêm.", imageUrl: "https://placehold.co/640x640/F59E0B/111827?text=Sun-shroom" },
        { name: "Fire-nut", type: "Plant", recipe: "Fire Peashooter + Wall-nut", ability: "Bắn đậu lửa và đốt cháy kẻ thù khi chúng cố ăn bạn.", imageUrl: "https://placehold.co/640x640/DC2626/FFFFFF?text=Fire-nut" },
        { name: "Cone Bruiser", type: "Zombie", recipe: "Conehead + Buckethead", ability: "Lớp giáp cực dày với khả năng tấn công đột phá ngắn.", imageUrl: "https://placehold.co/640x640/7C3AED/FFFFFF?text=Cone+Bruiser" },
        { name: "Tall-nut Peashooter", type: "Plant", recipe: "Tall-nut + Peashooter", ability: "Tường phòng thủ cao kết hợp bắn đậu liên tục.", imageUrl: "https://placehold.co/640x640/16A34A/FFFFFF?text=Tall+Pea" },
        { name: "Snorkel Garg", type: "Zombie", recipe: "Snorkel Zombie + Gargantuar", ability: "Gargantuar khổng lồ có thể bơi dưới nước và tấn công bất ngờ.", imageUrl: "https://placehold.co/640x640/2563EB/FFFFFF?text=Snorkel+Garg" },
      ];
      for (const f of fusionData) {
        await storage.createFusion({ ...f, fileUrl: null, videoUrl: null });
      }
    }

    const existingVideos = await storage.getVideos();
    if (existingVideos.length === 0) {
      await storage.createVideo({
        title: "PvZ Fusion Mod - Showcase Đầy Đủ",
        thumbnailUrl: "https://placehold.co/1280x720/DC2626/FFFFFF?text=Fusion+Showcase",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "Tour đầy đủ về mod, các fusion mới và hướng dẫn cài đặt bản mod.",
      });
      await storage.createVideo({
        title: "FusionDex - Hướng Dẫn Chi Tiết",
        thumbnailUrl: "https://placehold.co/1280x720/2563EB/FFFFFF?text=FusionDex+Guide",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "Phân tích công thức và kỹ năng, cộng với mẹo xây dựng đội hình mạnh.",
      });
      await storage.createVideo({
        title: "Top 10 Fusion Mạnh Nhất",
        thumbnailUrl: "https://placehold.co/1280x720/16A34A/FFFFFF?text=Top+10+Fusions",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "Danh sách 10 fusion mạnh nhất trong PvZ Fusion 2.1.",
      });
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed database");
  }
}

seedDatabase();

export default app;
