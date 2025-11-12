import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

export function getRedis() {
  if (!global.__redis) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("Missing REDIS_URL");
    global.__redis = new Redis(url, {
      // Optional hardening
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });
  }
  return global.__redis;
}