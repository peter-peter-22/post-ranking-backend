import { and, count, desc, eq, getTableColumns, gt, gte, not, SQL, sql } from "drizzle-orm";
import { db } from "../..";
import { redisClient } from "../../../redis/connect";
import { notifications } from "../../schema/notifications";
import { notificationsRedisKey } from "./common";
import { likes } from "../../schema/likes";
import { posts } from "../../schema/posts";
import { jsonb, PgColumn } from 'drizzle-orm/pg-core';
import { users } from "../../schema/users";
import { follows } from "../../schema/follows";

const notificationsPerPage = 50
const userPreviewsPerNotification = 10

export async function notificationList(userId: string, offset: number, lastChecked: Date) {
    // If this is the first page, clear redis
    if (offset === 0)
        await redisClient.del(notificationsRedisKey(userId));

    /** Get the columns of post previews. */
    const postJson = sql`
    json_build_object(
        'text',${posts.text},
        'media',${posts.media}
    )`

    /** Get the columns of user previews. */
    const userJson = sql`
    json_build_object(
        'name', ${users.name},
        'handle', ${users.handle},
        'avatar', ${users.avatar}
    )`

    /** Get the columns of reply preview. */
    const postWithUserJson = sql`
    json_build_object(
        'post',${postJson},
        'user',${userJson}
    )`

    /** On-demand data for like notifications. */
    const likeExtraData = sql`
    json_build_object(
        'users', 
        array(${db
            .select({ user: userJson })
            .from(likes)
            .where(and(
                eq(likes.postId, sql`(${notifications.data}->>'postId')::uuid`),
                gte(likes.createdAt, lastChecked)
            ))
            .innerJoin(users, eq(users.id, likes.userId))
            .orderBy(desc(likes.createdAt))
            .limit(userPreviewsPerNotification)
        }),
        'post',
        ${db
            .select({ post: postJson })
            .from(posts)
            .where(eq(posts.id, sql`(${notifications.data}->>'postId')::uuid`))
        },
        'count',
        ${db
            .select({ count: count() })
            .from(likes)
            .where(gte(likes.createdAt, lastChecked))
        }
    )`

    /** On-demand data for reply notifications. */
    const replyExtraData = sql`
    json_build_object(
        'replies', 
        array(${db
            .select({
                postWithUser: postWithUserJson
            })
            .from(posts)
            .where(and(
                eq(posts.replyingTo, sql`(${notifications.data}->>'postId')::uuid`),
                gte(posts.createdAt, lastChecked)
            ))
            .innerJoin(users, eq(users.id, posts.userId))
            .orderBy(desc(posts.createdAt))
            .limit(userPreviewsPerNotification)
        }),
        'post',
        ${db
            .select({ post: postJson })
            .from(posts)
            .where(eq(posts.id, sql`(${notifications.data}->>'postId')::uuid`))
        },
        'count',
        ${db
            .select({ count: count() })
            .from(posts)
            .where(eq(posts.id, sql`(${notifications.data}->>'postId')::uuid`))
        }
    )`

    /** On-demand data for follow notifications. */
    const followExtraData = sql`
    json_build_object(
        'users', 
        array(${db
            .select({
                user: userJson
            })
            .from(follows)
            .where(and(
                eq(follows.followedId, userId),
                gte(follows.createdAt, lastChecked)
            ))
            .innerJoin(users, eq(users.id, follows.followerId))
            .orderBy(desc(follows.createdAt))
            .limit(userPreviewsPerNotification)
        }),
        'count',
        ${db
            .select({ count: count() })
            .from(follows)
            .where(and(
                eq(follows.followedId, userId),
                gte(follows.createdAt, lastChecked)
            ))
        }
    )`

    /** On-demand data for mention notifications. */
    const mentionExtraData = sql`
    json_build_object(
        'post', 
        ${db
            .select({
                postWithUser: postWithUserJson
            })
            .from(posts)
            .where(and(
                eq(posts.id, sql`(${notifications.data}->>'postId')::uuid`),
            ))
            .innerJoin(users, eq(users.id, posts.userId))
        }
    )`

    /** Select the notifications and generate their extra data when they are viewed for the first time. */
    const q = db
        .select({
            ...getTableColumns(notifications),
            read: not(gt(notifications.createdAt, lastChecked)),
            extraData: sql`
            case 
                when ${eq(notifications.type, "like")}
                then ${likeExtraData}
                when ${eq(notifications.type, "reply")}
                then ${replyExtraData}
                when ${eq(notifications.type, "follow")}
                then ${followExtraData}
                when ${eq(notifications.type, "mention")}
                then ${mentionExtraData}
            else null end`
        })
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(
            desc(notifications.createdAt)
        )
        .offset(offset)
        .limit(notificationsPerPage)

    console.log(q.toSQL())

    return await q
}