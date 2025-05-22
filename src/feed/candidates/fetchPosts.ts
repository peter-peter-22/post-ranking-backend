import { aliasedTable, and, eq, exists } from "drizzle-orm"
import { CandidateCommonData, CandidateSubquery } from "."
import { db } from "../../db"
import { follows } from "../../db/schema/follows"
import { posts } from "../../db/schema/posts"
import { likes } from "../../db/schema/likes"
import { engagementHistory } from "../../db/schema/engagementHistory"
import { users } from "../../db/schema/users"
import { countCandidateSources } from "./logCandidateSources"

/** Use candidate selectors to fetch posts then add metadata to the posts. 
 * @param candidateSqs The subqueries of the candidate sources.
 * @param common The common data of the candidate selection.
 * @returns The posts with metadata.
*/
export async function fetchPosts(candidateSqs: CandidateSubquery[], common: CandidateCommonData) {
    // Exit if no candidate selectors
    if (candidateSqs.length === 0) {
        console.log("All candidate selectors cancelled")
        return []
    }

    // Union the subqueries
    let unionSq = candidateSqs[0].$dynamic()
    for (const sq of candidateSqs.slice(1))
        unionSq = unionSq.unionAll(sq)

    // Create a with query from all candidate selectors
    const candidates = db.$with("candidate_union").as(unionSq)

    // Post-processing subqueries

    // Followed by viewer
    const isFollowedSq = exists(db
        .select()
        .from(follows)
        .where(and(
            eq(follows.followerId, common.user.id),
            eq(follows.followedId, candidates.userId)
        ))

    ).as<boolean>("followed_by_viewer")

    // Replied by followed user
    const replies = aliasedTable(posts, "replies")
    const isRepliedByFollowedSq = exists(db
        .select()
        .from(replies)
        .where(and(
            eq(replies.replyingTo, candidates.id),
        ))
        .innerJoin(follows, and(
            eq(follows.followedId, replies.userId),
            eq(follows.followerId, common.user.id)
        ))
    ).as<boolean>("replied_by_followed")

    // Liked by viewer
    const likedByViewerSq = exists(db
        .select()
        .from(likes)
        .where(and(
            eq(likes.postId, candidates.id),
            eq(likes.userId, common.user.id)
        ))
    ).as<boolean>("liked_by_viewer")

    // Fetch
    let postsToDisplay = await db
        .with(candidates)
        .select({
            id: candidates.id,
            text: candidates.text,
            createdAt: candidates.createdAt,
            likes: candidates.likeCount,
            replies: candidates.replyCount,
            clicks: candidates.clickCount,
            views: candidates.viewCount,
            similarity: candidates.similarity,
            candidateType: candidates.candidateType,
            engagementHistory: engagementHistory,
            followed: isFollowedSq,
            repliedByFollowed: isRepliedByFollowedSq,
            liked: likedByViewerSq,
            user: users,
            media: candidates.media,
            //debug
            keywords: candidates.keywords,
            embeddingText: candidates.embeddingText
        })
        .from(candidates)
        .innerJoin(users, eq(users.id, candidates.userId))
        .leftJoin(engagementHistory, and(
            eq(engagementHistory.viewerId, common.user.id),
            eq(engagementHistory.publisherId, candidates.userId)
        ))

    // Log candidate sources
    console.log("Before deduplication")
    countCandidateSources(postsToDisplay)

    // Deduplicate
    postsToDisplay = deduplicatePosts(postsToDisplay)

    // Log candidate sources
    console.log("After deduplication")
    countCandidateSources(postsToDisplay)
    return postsToDisplay
}

export type PostToDisplay = Awaited<ReturnType<typeof fetchPosts>>[number];

/** Remove posts with duplicated ids. */
function deduplicatePosts(posts: PostToDisplay[]) {
    const seen = new Set<string>();
    return posts.filter(post => {
        if (seen.has(post.id))
            return false;
        else {
            seen.add(post.id);
            return true;
        }
    })
}