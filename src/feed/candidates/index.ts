import { aliasedTable, and, cosineDistance, eq, exists, getTableColumns, sql, SQL } from "drizzle-orm";
import { db } from "../../db";
import { getFollowedUsers } from "../../db/controllers/users/getFollowers";
import { follows } from "../../db/schema/follows";
import { likes } from "../../db/schema/likes";
import { posts } from "../../db/schema/posts";
import { User, users } from "../../db/schema/users";
import { commonFilters } from "../filters";
import { getEmbeddingSimilarityCandidates } from "./sources/embedding";
import { getFollowedCandidates } from "./sources/followed";
import { getGraphClusterCandidates } from "./sources/graphCluster";
import { getTrendCandidates } from "./sources/trending";
import { getRepliedByFollowedCandidates } from "./sources/repliedByFollowed";
import { engagementHistory } from "../../db/schema/engagementHistory";

/** Selecting candidate posts from all groups */
export async function getCandidates(common: CandidateCommonData) {
    // Get the subqueries of the embedding candidate sources and union them

    // Followed
    let merged = getFollowedCandidates(common)
    // Replied by followed
    const followedSq = getRepliedByFollowedCandidates(common)
    merged.unionAll(followedSq)
    // Graph cluster
    const graphClusterSq = getGraphClusterCandidates(common)
    if (graphClusterSq)
        merged.unionAll(graphClusterSq)
    // Embedding
    const embeddingSq = getEmbeddingSimilarityCandidates(common)
    if (embeddingSq)
        merged.unionAll(embeddingSq)
    // Trending
    const trendingSqs = await getTrendCandidates(common)
    for (const sq of trendingSqs)
        merged.unionAll(sq)

    // Create a with query from all candidate selectors
    const unionSq = db.$with("candidate_union").as(merged)

    // Post-processing subqueries

    // Followed by viewer
    const isFollowedSq = exists(db
        .select()
        .from(follows)
        .where(and(
            eq(follows.followerId, common.user.id),
            eq(follows.followedId, unionSq.userId)
        ))
        
    ).as<boolean>("followed_by_viewer")

    // Replied by followed user
    const replies=aliasedTable(posts,"replies")
    const isRepliedByFollowedSq = exists(db
        .select()
        .from(replies)
        .where(and(
            eq(replies.replyingTo, unionSq.id),
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
            eq(likes.postId, unionSq.id),
            eq(likes.userId, common.user.id)
        ))
    ).as<boolean>("liked_by_viewer")

    // Post processing
    return await db
        .with(unionSq)
        .select({
            id: unionSq.id,
            text: unionSq.text,
            createdAt: unionSq.createdAt,
            likes: unionSq.likeCount,
            replies: unionSq.replyCount,
            clicks: unionSq.clickCount,
            views: unionSq.viewCount,
            similarity: unionSq.similarity,
            candidateType: unionSq.candidateType,
            engagementHistory: engagementHistory,
            followed: isFollowedSq,
            repliedByFollowed: isRepliedByFollowedSq,
            liked: likedByViewerSq,
            user:users,
            media:unionSq.media,
            //debug
            keywords:unionSq.keywords,
            embeddingText:unionSq.embeddingText
        })
        .from(unionSq)
        .innerJoin(users,eq(users.id, unionSq.userId))
        .leftJoin(engagementHistory, and(
            eq(engagementHistory.viewerId, common.user.id),
            eq(engagementHistory.publisherId, unionSq.userId)
        ))
}

/** Post with relative data returned by the candidate selector. */
export type PostCandidate=Awaited<ReturnType<typeof getCandidates>>[number]

// Remove unnecessary columns from the post
const { embedding, ...simplePostColumns } = getTableColumns(posts)

/** The columns those are selected from the post candidates. */
export function candidateColumns(user: User, candidateType: CandidateSource = "EmbeddingSimilarity") {
    return {
        ...simplePostColumns,
        candidateType: sql<string>`${candidateType}`.as("candidate_type"),
        similarity: (user.embedding ? sql<number>`1 - (${cosineDistance(posts.embedding, user.embedding)})` : sql<number>`0`).as("embedding_similarity"),
    }
}

/** Get values those are shared by multiple candidate selectors. */
export async function getCommonData(user: User): Promise<CandidateCommonData> {
    const followedUsers = await getFollowedUsers({ user })
    return {
        user,
        followedUsers,
        commonFilters: commonFilters()
    }
}

export type CandidateCommonData = {
    user: User,
    followedUsers: string[],
    commonFilters: SQL[]
}

/** The type of the post candidate. */
export type CandidateSource = "Followed" | "RepliedByFollowed" | "GraphClusters" | "EmbeddingSimilarity" | "Trending"
