import { aliasedTable, and, eq, gt, SQL } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { db } from "../..";
import { clicks } from "../../schema/clicks";
import { engagementHistory, EngagementHistoryToInsert } from "../../schema/engagementHistory";
import { likes } from "../../schema/likes";
import { posts } from "../../schema/posts";
import { chunkedInsert } from "../../utils/chunkedInsert";

/** Filter out the engagements those are older than 30 days
 * @param column The date column.
 * @returns The filter function.
 */
export const recencyFilter = (column: PgColumn): SQL => {
    // Define the age limit.
    const maxAge = 1000 * 60 * 60 * 24 * 30 // 30 days
    const maxAgeDate = new Date(Date.now() - maxAge)
    return gt(column, maxAgeDate)
}

/** Make the engagement counts required to avoid type error while updating them. */
type EngagementHistoryToInsertOrUpdate = Required<EngagementHistoryToInsert>

/**Recalculate the engagement history of the selected user. */
export async function updateEngagementHistory(userId: string) {
    // Delete the existing history of the selected user.
    await db.delete(engagementHistory).where(eq(engagementHistory.viewerId, userId))
    // Get the recent engagement history of the selected user.
    const userHistory = await getEngagementHistory(userId);
    // Insert the new engagement history of the selected user. Use chunked insert to prevent exceeding the max row limit. The user can interact with over 10k users in a month.
    await chunkedInsert(userHistory, async (rows) => { await db.insert(engagementHistory).values(rows) })
}

/**
 * Create or update the engagement history of the selected users.
 * @param engagementMap Engagement history map.
 * @param updateFn Function to update the right value of the engagement history.
 * @param rows The engagements to process.
 * @param userId The id of the viewer.
 */
function processRows(engagementMap: Map<string, EngagementHistoryToInsertOrUpdate>, engagementType: "likes" | "replies" | "clicks", userId: string, rows: { userId: string }[]) {
    /** Get or create the engagement history between the viewer and a selected user. */
    const getOrCreateHistory = (id: string): EngagementHistoryToInsertOrUpdate => {
        // Check if the history of this user exists.
        const history: EngagementHistoryToInsertOrUpdate | undefined = engagementMap.get(id);
        if (history) return history;
        // If the history does not exist, create a new one.
        else {
            const newHistory: EngagementHistoryToInsertOrUpdate = {
                viewerId: userId,
                publisherId: id,
                likes: 0,
                replies: 0,
                clicks: 0,
            }
            engagementMap.set(id, newHistory);
            return newHistory;
        }
    }
    /** The ids of the interacted users. */
    const posterIds: string[] = rows.map((like) => like.userId)
    // Count the specified type of engagements between the viewer and each user.
    for (const id of posterIds) {
        getOrCreateHistory(id)[engagementType]++;
    }
}

async function getEngagementHistory(userId: string): Promise<EngagementHistoryToInsertOrUpdate[]> {
    /** The collection of all engagements. */
    const engagementMap = new Map<string, EngagementHistoryToInsertOrUpdate>();
    // Process the likes.
    processRows(
        engagementMap,
        "likes",
        userId,
        await db
            .select({
                userId: posts.userId
            })
            .from(likes)
            .where(
                and(
                    eq(likes.userId, userId),
                    recencyFilter(likes.createdAt)
                )
            )
            .innerJoin(posts, eq(likes.postId, posts.id))
    )

    // Process the replies
    const replies = aliasedTable(posts, "replies")
    processRows(
        engagementMap,
        "replies",
        userId,
        await db
            .select({
                userId: posts.userId
            })
            .from(replies)
            .where(
                and(
                    eq(replies.userId, userId),
                    recencyFilter(replies.createdAt),
                    eq(replies.isReply,true)
                )
            )
            .innerJoin(posts, eq(replies.replyingTo, posts.id))
    )

    // Process the clicks
    processRows(
        engagementMap,
        "clicks",
        userId,
        await db
            .select({
                userId: posts.userId
            })
            .from(clicks)
            .where(
                and(
                    eq(clicks.userId, userId),
                    recencyFilter(clicks.createdAt)
                )
            )
            .innerJoin(posts, eq(clicks.postId, posts.id))
    )

    // Format and return the aggregated engagement histories.
    return Array.from(engagementMap.values())
}