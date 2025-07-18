import { and, eq } from "drizzle-orm";
import { db } from "../..";
import { redisClient } from "../../../redis/connect";
import { notifications } from "../../schema/notifications";
import { notificationsRedisKey, redisSetPlaceholder } from "./common";

export async function getNotificationCount(userId: string): Promise<number> {
    // Try to get the unread notification count from redis

    const redisKey = notificationsRedisKey(userId);

    const count = await redisClient.sCard(redisKey)
    const realCount=count-1
    const exists=count>0

    if (exists) return realCount;

    // If it does not exists, get from the database then set in redis

    console.log("Notifications are not in redis, falling back to database");
    const keysFromDb = await getUnreadNotificationKeysFromDB(userId);
    if (keysFromDb.length > 0) {
        await redisClient.sAdd(redisKey, [redisSetPlaceholder,...keysFromDb.map(key => key.key)])
    }

    return keysFromDb.length;
}

async function getUnreadNotificationKeysFromDB(userId: string) {
    return await db
        .select({key:notifications.key})
        .from(notifications)
        .where(and(
            eq(notifications.userId, userId),
            eq(notifications.read,false)
        ))
}