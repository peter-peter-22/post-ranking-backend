import { redisClient } from "../redis/connect";
import { addUpdateJob } from "./updates";

export function postViewCounterRedis(postId: string) {
    return `viewCount/${postId}`
}

export async function incrementViewCounter(postId: string, add: number) {
    await Promise.all([
        redisClient.incrBy(postViewCounterRedis(postId), add),
        addUpdateJob("viewCount", postId)
    ])
}