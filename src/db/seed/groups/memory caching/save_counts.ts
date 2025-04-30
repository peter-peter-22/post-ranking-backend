import { eq } from "drizzle-orm";
import { db } from "../../..";
import { chunkedInsert } from "../../../chunkedInsert";
import { posts } from "../../../schema/posts";
import { PostEngagementCounts } from "./postEngagements";
import { EngagementHistory, engagementHistory } from "../../../schema/engagementHistory";

/** Apply the engagement counts from the memory to the database to avoid recalculating them unnecessarily. 
 * @param engagement_counts Array of engagement count entries to apply.
*/
export async function applyMemoryEngagementCounts(engagement_counts: PostEngagementCounts[]) {
    await chunkedInsert(
        engagement_counts,
        async (batch_counts) => {
            await db.transaction(async tx => {
                for (const [id, counts] of batch_counts) {
                    await tx
                        .update(posts)
                        .set({
                            likeCount: counts.likes,
                            replyCount: counts.replies,
                            clickCount: counts.clicks,
                            viewCount: counts.views
                        })
                        .where(eq(posts.id, id))
                }
            })
        }
    )
}

/** Apply the engagement counts from the memory to the database to avoid recalculating them unnecessaryly.
 * @param engagement_counts Array of engagement count entries to apply.
 */
export async function applyMemoryEngagementHistory(engagement_histories: EngagementHistory[]) {
    await chunkedInsert(
        engagement_histories,
        async (batch_histories) => {
            await db
                .insert(engagementHistory)
                .values(batch_histories)
                .onConflictDoNothing()
        }
    )
}