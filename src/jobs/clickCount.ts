import { redisClient } from "../redis/connect";
import { addUpdateJob } from "./updates";

export function postClickCounterRedis(postId: string) {
    return `clickCount/${postId}`
}

export async function incrementClickCounter(postId: string, add: number) {
    await Promise.all([
        redisClient.incrBy(postClickCounterRedis(postId), add),
        addUpdateJob("clickCount", postId)
    ])
}