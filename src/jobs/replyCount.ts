import { redisClient } from "../redis/connect";
import { scheduleEngagementHistoryUpdate } from "./engagementHistory";
import { standardJobs } from "./updates";

export function postReplyCounterRedis(postId: string) {
    return `replyCount/${postId}`
}

export async function incrementReplyCounter(postId: string, userId: string, add: number) {
    await Promise.all([
        redisClient.incrBy(postReplyCounterRedis(postId), add),
        standardJobs.addJob("replyCount", postId),
        scheduleEngagementHistoryUpdate(userId)
    ])
}