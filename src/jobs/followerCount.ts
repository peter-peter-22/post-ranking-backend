import { redisClient } from "../redis/connect";
import { standardJobs } from "./updates";

export function userFollowerCountRedis(userId: string) {
    return `followerCount/${userId}`
}

export async function incrementFollowerCounter(userId: string, add: number) {
    await Promise.all([
        redisClient.incrBy(userFollowerCountRedis(userId), add),
        standardJobs.addJob("followerCount", userId)
    ])
}