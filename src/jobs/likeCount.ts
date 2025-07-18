import { redisClient } from "../redis/connect";
import { postLikeCounterRedis } from "../userActions/posts/like";
import { scheduleEngagementHistoryUpdate } from "./engagementHistory";
import { standardJobs } from "./updates";

export async function incrementLikeCounter(postId: string,userId:string, add: number) {
    await Promise.all([
        redisClient.incrBy(postLikeCounterRedis(postId), add),
        standardJobs.addJob("likeCount", postId),
        scheduleEngagementHistoryUpdate(userId),
    ])
}