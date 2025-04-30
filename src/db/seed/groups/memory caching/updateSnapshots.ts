import { db } from "../../..";
import { chunkedInsert } from "../../../chunkedInsert";
import { EngagementHistory } from "../../../schema/engagementHistory";
import { FollowToInsert } from "../../../schema/follows";
import { postSnapshots } from "../../../schema/postSnapshots";
import { PostEngagementCounts } from "./postEngagements";

export async function updatePostSnapshots(engagementCounts: PostEngagementCounts[]) {
    if (engagementCounts.length === 0)
        return
    
    await chunkedInsert(
        engagementCounts,
        async (batchEngagementCounts) => {
            await db
                .insert(postSnapshots)
                .values(
                    batchEngagementCounts.map(([id, counts]) => ({
                        postId: id,
                        likeCount: counts.likes,
                        replyCount: counts.replies,
                        clickCount: counts.clicks,
                        viewCount: counts.views,
                    }))
                )
        }
    )
}

export async function updateHistorySnapshots(engagementHistories: EngagementHistory[]) {

}

export async function updateFollowSnapshots(follows: FollowToInsert[]) {

}
