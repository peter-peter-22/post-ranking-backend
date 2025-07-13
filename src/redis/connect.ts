// Connect to redis and export the client.

import redis from "redis";
import { env } from "../zod/env";

function createRedisClient(db: number = 0) {
    const redisClient = redis.createClient({
        socket: {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
        },
        database:db
    });

    redisClient.on('error', (err) => {
        console.error('Redis error:', err);
    });

    redisClient.connect().then(() => console.log("Redis connected"))

    return redisClient
}

/** Redis client for caching. */
const redisClient = createRedisClient()

/** Redis client for job queue. */
const redisJobs = createRedisClient(1)

export { redisClient,redisJobs }