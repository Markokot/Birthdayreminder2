import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

declare module "express-session" {
  interface SessionData {
    user: {
      username: string;
      role: string;
    };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "simple_secret_key",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
    })
  );

  // Authentication Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.session && req.session.user) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Auth Routes
  app.post(api.auth.login.path, (req, res) => {
    const { username, password } = req.body;
    // Hardcoded credentials as requested
    // In a real app, use env vars or DB
    if (username === "admin" && password === "1232") {
      req.session.user = { username: "admin", role: "admin" };
      return res.json({ success: true });
    }
    return res.status(401).json({ message: "Invalid credentials" });
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.session && req.session.user) {
      res.json(req.session.user);
    } else {
      res.json(null);
    }
  });

  // Birthday Routes - Protected
  app.get(api.birthdays.list.path, requireAuth, async (req, res) => {
    const list = await storage.getBirthdays();
    res.json(list);
  });

  app.get(api.birthdays.get.path, requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const item = await storage.getBirthday(id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.post(api.birthdays.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.birthdays.create.input.parse(req.body);
      const item = await storage.createBirthday(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.birthdays.update.path, requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.birthdays.update.input.parse(req.body);
      const item = await storage.updateBirthday(id, input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      // Handle "Not found" error from storage if needed, or simple try/catch
      res.status(404).json({ message: "Not found or error updating" });
    }
  });

  app.delete(api.birthdays.delete.path, requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteBirthday(id);
    res.sendStatus(204);
  });

  // Seed data if empty
  const existing = await storage.getBirthdays();
  if (existing.length === 0) {
    console.log("Seeding initial data...");
    await storage.createBirthday({
      name: "Андрей",
      birthDate: "1990-07-15",
      description: "Любит рыбалку и технику. (Пример из задачи)",
      isGiftRequired: true,
      isReminderSet: true
    });
    await storage.createBirthday({
      name: "Марина",
      birthDate: "1995-02-20",
      description: "Цветы и книги.",
      isGiftRequired: false,
      isReminderSet: true
    });
    await storage.createBirthday({
      name: "Бабушка",
      birthDate: "1950-12-05",
      description: "Позвонить заранее!",
      isGiftRequired: true,
      isReminderSet: false
    });
  }

  return httpServer;
}
