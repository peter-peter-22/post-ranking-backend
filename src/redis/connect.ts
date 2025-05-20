// Connect to redis and export the client.

import redis from "redis";
import { env } from "../zod/env";

const redisClient = redis.createClient({
    socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT, 
    },
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.connect().then(()=>console.log("Redis connected"))

export {redisClient}