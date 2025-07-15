import { redisClient } from "../redis/connect";
import { addUpdateJob } from "./updates";

export function userFollowingCountRedis(userId: string) {
    return `followingCount/${userId}`
}

export async function incrementFollowingCounter(userId: string, add: number) {
    await Promise.all([
        redisClient.incrBy(userFollowingCountRedis(userId), add),
        addUpdateJob("followingCount", userId)
    ])
}