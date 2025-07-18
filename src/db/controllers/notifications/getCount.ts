import { and, eq } from "drizzle-orm";
import { db } from "../..";
import { redisClient } from "../../../redis/connect";
import { notifications } from "../../schema/notifications";
import { notificationsRedisKey } from "./common";

export async function getNotificationCount(userId: string): Promise<number> {
    // Try to get the unread notification count from redis

    const redisKey = notificationsRedisKey(userId);

    const [countResult, existsResult] = await redisClient
        .multi()
        .sCard(redisKey)
        .exists(redisKey)
        .exec();

    const count = countResult as number;
    const exists = existsResult as number;

    if (exists) return count;

    // If it does not exists, get from the database then set in redis

    const keysFromDb = await getUnreadNotificationKeysFromDB(userId);
    if (keysFromDb.length > 0) {
        await redisClient.sAdd(redisKey, keysFromDb.map(key => key.key))
    }

    return keysFromDb.length;
}

async function getUnreadNotificationKeysFromDB(userId: string) {
    return await db
        .select({key:notifications.key})
        .from(notifications)
        .where(and(
            eq(notifications.userId, userId),
        ))
}