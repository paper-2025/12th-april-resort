import { Redis } from "@upstash/redis";

const url =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL;

const token =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  throw new Error(
    `Redis env vars missing.
KV_REST_API_URL: ${Boolean(process.env.KV_REST_API_URL)}
KV_REST_API_TOKEN: ${Boolean(process.env.KV_REST_API_TOKEN)}
UPSTASH_REDIS_REST_URL: ${Boolean(process.env.UPSTASH_REDIS_REST_URL)}
UPSTASH_REDIS_REST_TOKEN: ${Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)}`
  );
}

export const redis = new Redis({ url, token });
