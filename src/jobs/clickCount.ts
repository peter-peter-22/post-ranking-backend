import { redisClient } from "../redis/connect";
import { scheduleEngagementHistoryUpdate } from "./engagementHistory";
import { standardJobs } from "./updates";

export function postClickCounterRedis(postId: string) {
    return `clickCount/${postId}`
}

export async function incrementClickCounter(postId: string, userId: string, add: number) {
    await Promise.all([
        redisClient.incrBy(postClickCounterRedis(postId), add),
        standardJobs.addJob("clickCount", postId),
        scheduleEngagementHistoryUpdate(userId)
    ])
}