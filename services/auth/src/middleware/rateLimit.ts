import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient, redisReady } from "../utils/redis.js";

const createLimiter = (
  prefix: string,
  windowMs: number,
  limit: number,
  message: string,
) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,

    store: new RedisStore({
      prefix,
      sendCommand: async (...args: string[]) => {
        await redisReady;
        return redisClient.sendCommand(args);
      },
    }),

    message: {
      success: false,
      message,
    },
  });

export const loginLimiter = createLimiter(
  "rl:auth:login:",
  15 * 60 * 1000,
  10,
  "Too many login attempts. Please try again later.",
);

export const registerLimiter = createLimiter(
  "rl:auth:register:",
  60 * 60 * 1000,
  5,
  "Too many registration attempts. Please try again later.",
);

export const forgotPasswordLimiter = createLimiter(
  "rl:auth:forgot:",
  15 * 60 * 1000,
  5,
  "Too many password reset requests. Please try again later.",
);

export const resetPasswordLimiter = createLimiter(
  "rl:auth:reset:",
  15 * 60 * 1000,
  10,
  "Too many password reset attempts. Please try again later.",
);
