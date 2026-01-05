// src/lib/redis.ts  (or lib/redis.ts)
import { Redis } from "@upstash/redis";

const url =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.UPSTASH_REDIS_REST_ENDPOINT;

const token =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  // This throws a clear error instead of "undefined/set/..."
  throw new Error(
    `Missing Redis env vars.
Have KV_REST_API_URL? ${Boolean(process.env.KV_REST_API_URL)}
Have KV_REST_API_TOKEN? ${Boolean(process.env.KV_REST_API_TOKEN)}
Have UPSTASH_REDIS_REST_URL? ${Boolean(process.env.UPSTASH_REDIS_REST_URL)}
Have UPSTASH_REDIS_REST_TOKEN? ${Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)}`
  );
}

export const redis = new Redis({ url, token });
