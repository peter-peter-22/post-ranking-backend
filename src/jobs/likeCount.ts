import { redisClient } from "../redis/connect";
import { postLikeCounterRedis } from "../userActions/posts/like";
import { addUpdateJob } from "./updates";

export async function incrementLikeCounter(postId: string, add: number) {
    await Promise.all([
        redisClient.incrBy(postLikeCounterRedis(postId), add),
        addUpdateJob("likeCount", postId)
    ])
}