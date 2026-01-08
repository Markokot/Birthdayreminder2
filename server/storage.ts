import { 
  type Birthday, 
  type InsertBirthday 
} from "@shared/schema";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  getBirthdays(): Promise<Birthday[]>;
  getBirthday(id: number): Promise<Birthday | undefined>;
  createBirthday(birthday: InsertBirthday): Promise<Birthday>;
  updateBirthday(id: number, updates: Partial<InsertBirthday>): Promise<Birthday>;
  deleteBirthday(id: number): Promise<void>;
}

export class JsonFileStorage implements IStorage {
  private filePath: string;
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), "data");
    this.filePath = path.join(this.dataDir, "birthdays.json");
    this.ensureFile();
  }

  private async ensureFile() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      try {
        await fs.access(this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([]));
      }
    } catch (error) {
      console.error("Failed to initialize storage:", error);
    }
  }

  private async readData(): Promise<Birthday[]> {
    try {
      await this.ensureFile();
      const content = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(content) as Birthday[];
    } catch (error) {
      console.error("Error reading data:", error);
      return [];
    }
  }

  private async writeData(data: Birthday[]) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async getBirthdays(): Promise<Birthday[]> {
    return this.readData();
  }

  async getBirthday(id: number): Promise<Birthday | undefined> {
    const data = await this.readData();
    return data.find((b) => b.id === id);
  }

  async createBirthday(insertBirthday: InsertBirthday): Promise<Birthday> {
    const data = await this.readData();
    // Simple ID generation: max + 1
    const maxId = data.reduce((max, b) => Math.max(max, b.id), 0);
    const newBirthday: Birthday = {
      ...insertBirthday,
      id: maxId + 1,
      // Ensure optional fields are handled if missing in Insert type (though schema has defaults, here we are manual)
      isGiftRequired: insertBirthday.isGiftRequired ?? false,
      isReminderSet: insertBirthday.isReminderSet ?? false,
      description: insertBirthday.description ?? null,
    };
    data.push(newBirthday);
    await this.writeData(data);
    return newBirthday;
  }

  async updateBirthday(id: number, updates: Partial<InsertBirthday>): Promise<Birthday> {
    const data = await this.readData();
    const index = data.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Birthday not found");

    const current = data[index];
    const updated = { ...current, ...updates };
    data[index] = updated;
    await this.writeData(data);
    return updated;
  }

  async deleteBirthday(id: number): Promise<void> {
    const data = await this.readData();
    const filtered = data.filter((b) => b.id !== id);
    if (filtered.length !== data.length) {
      await this.writeData(filtered);
    }
  }
}

export const storage = new JsonFileStorage();
