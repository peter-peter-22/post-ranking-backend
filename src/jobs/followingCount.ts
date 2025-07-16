import { redisClient } from "../redis/connect";
import { standardJobs } from "./updates";

export function userFollowingCountRedis(userId: string) {
    return `followingCount/${userId}`
}

export async function incrementFollowingCounter(userId: string, add: number) {
    await Promise.all([
        redisClient.incrBy(userFollowingCountRedis(userId), add),
        standardJobs.addJob("followingCount", userId)
    ])
}