// Connect to redis and export the client.

import redis from "redis";

const cache = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT!), 
    },
});

cache.on('error', (err) => {
    console.error('Redis error:', err);
});

cache.connect();

export {cache}