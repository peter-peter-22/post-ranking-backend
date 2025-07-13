import { redisClient } from "../redis/connect";
import { addUpdateJob } from "./updates";

export function postReplyCounterRedis(postId: string) {
    return `replyCount/${postId}`
}

export async function incrementReplyCounter(postId: string, add: number) {
    await Promise.all([
        redisClient.incrBy(postReplyCounterRedis(postId), add),
        addUpdateJob("replyCount", postId)
    ])
}