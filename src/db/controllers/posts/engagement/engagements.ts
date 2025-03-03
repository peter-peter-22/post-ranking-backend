import { sql, SQL } from "drizzle-orm";
import { db } from "../../..";
import { scorePerClick, scorePerLike, scorePerReply } from "../../../../feed";
import { posts } from "../../../schema/posts";

/**Recalculate the like count on the selected posts. 
 ** The count of the likes, replies, views and clicks must be up to date before using.
*/
export async function updateEngagementAggregations(where: SQL | undefined = undefined) {
    await db.update(posts)
        .set({
            engagementCount: sql<number>`(
                ${posts.likeCount} +
                ${posts.replyCount} +
                ${posts.clickCount}
            )`,
            engagementScore: sql<number>`(
                ${posts.likeCount} * ${scorePerLike} +
                ${posts.replyCount} * ${scorePerReply} +
                ${posts.clickCount} * ${scorePerClick}
            )`,
            engagementScoreFrequency: sql<number>`(
                (
                    ${posts.likeCount} * ${scorePerLike} +
                    ${posts.replyCount} * ${scorePerReply} +
                    ${posts.clickCount} * ${scorePerClick}
                )::REAL
                /
                COALESCE(NULLIF(
                    EXTRACT(EPOCH FROM ${posts.createdAt}) / ${3600},
                0), 1)  
            )`,
            engagementScoreRate: sql<number>`(
                (
                    ${posts.likeCount} * ${scorePerLike} +
                    ${posts.replyCount} * ${scorePerReply} +
                    ${posts.clickCount} * ${scorePerClick}
                )::REAL
                /
                COALESCE(NULLIF(
                    ${posts.viewCount},
                0), 1)
            )`,
        })
        .where(
            where
        )
        .catch(
            error => console.error("error while updating engagement aggregations:", error)
        )
}