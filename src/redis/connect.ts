// Connect to redis and export the client.

import redis from "redis";
import { env } from "../zod/env";

const cache = redis.createClient({
    socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT, 
    },
});

cache.on('error', (err) => {
    console.error('Redis error:', err);
});

cache.connect().then(()=>console.log("Redis connected"))

export {cache}