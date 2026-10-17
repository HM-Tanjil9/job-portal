import "dotenv/config";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not configured");
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (error) => {
  console.error("Redis client error:", error);
});

export const redisReady = redisClient.connect().then(() => {
  console.log("✅ Redis connected successfully.");
});
