import { aliasedTable, and, cosineDistance, eq, exists, inArray, sql } from "drizzle-orm"
import { db } from "../db"
import { EngagementHistory, engagementHistory } from "../db/schema/engagementHistory"
import { follows } from "../db/schema/follows"
import { likes } from "../db/schema/likes"
import { posts } from "../db/schema/posts"
import { User, users } from "../db/schema/users"
import { CandidateSource, PostCandidate } from "./common"

/** Use an array of post ids to fetch posts and their data. */
export async function hydratePosts(candidates: string[], user: User | undefined) {
    if (candidates.length === 0)
        return []

    // With query to get the posts of the provided ids
    const hydratePosts = db.$with("post_ids_to_hydrate").as(
        db
            .select()
            .from(posts)
            .where(inArray(posts.id, candidates))
    )

    // Followed by viewer
    const isFollowedSq = (user ? (
        exists(db
            .select()
            .from(follows)
            .where(and(
                eq(follows.followerId, user.id),
                eq(follows.followedId, hydratePosts.userId)
            )))
    ) : (
        sql<boolean>`false::boolean`
    )).as<boolean>("followed_by_viewer")

    // Replied by followed user
    const replies = aliasedTable(posts, "replies")
    const isRepliedByFollowedSq = (user ? (
        exists(db
            .select()
            .from(replies)
            .where(and(
                eq(replies.replyingTo, hydratePosts.id),
            ))
            .innerJoin(follows, and(
                eq(follows.followedId, replies.userId),
                eq(follows.followerId, user.id)
            )))
    ) : (
        sql<boolean>`false::boolean`
    )).as<boolean>("replied_by_followed")

    // Liked by viewer
    const likedByViewerSq = (user ? (
        exists(db
            .select()
            .from(likes)
            .where(and(
                eq(likes.postId, hydratePosts.id),
                eq(likes.userId, user.id)
            ))
        )
    ) : (
        sql<boolean>`false::boolean`
    )).as<boolean>("liked_by_viewer")

    // Embedding similarty between the viewer and the post
    const similarity = (user?.embedding ? (
        sql<number>`1 - (${cosineDistance(hydratePosts.embedding, user.embedding)})`
    ) : (
        sql<number>`0::real`
    )).as("embedding_similarity")

    // The main query
    const query = db
        .with(hydratePosts)
        .select({
            id: hydratePosts.id,
            text: hydratePosts.text,
            createdAt: hydratePosts.createdAt,
            likes: hydratePosts.likeCount,
            replies: hydratePosts.replyCount,
            clicks: hydratePosts.clickCount,
            views: hydratePosts.viewCount,
            similarity: similarity,
            engagementHistory: user ? engagementHistory : sql<EngagementHistory>`null`,
            followed: isFollowedSq,
            repliedByFollowed: isRepliedByFollowedSq,
            liked: likedByViewerSq,
            user: users,
            media: hydratePosts.media,
            //debug
            keywords: hydratePosts.keywords,
            embeddingText: hydratePosts.embeddingText,
            commentScore: hydratePosts.commentScore,
        })
        .from(hydratePosts)
        .innerJoin(users, eq(users.id, hydratePosts.userId))
        .$dynamic()

    // Engagement history between the viewer and the poster
    if (user)
        query.leftJoin(engagementHistory, and(
            eq(engagementHistory.viewerId, user.id),
            eq(engagementHistory.publisherId, hydratePosts.userId)
        ))


    // Fetch
    const hydratedPosts = await query
    return hydratedPosts
}

export type HydratedPost = Awaited<ReturnType<typeof hydratePosts>>[number] & {
    score?: number
    source?: CandidateSource
};

/** Set the candidate source of the hydrated posts based on the canditates those were used to create them. */
export function addMetaToHydratedPosts(candidates: PostCandidate[], hydratedPosts: HydratedPost[]) {
    // Create a map of ids and candidate sources
    const candidatesMap: Map<string, PostCandidate> = new Map()
    candidates.forEach(c => {
        candidatesMap.set(c.id, c)
    });

    // Set the candidate sources of the posts
    hydratedPosts.forEach(post => {
        const candidate = candidatesMap.get(post.id)
        post.source = candidate?.source || "Unknown"
        post.score = candidate?.score || 0
    })
}

/** Return the ids of the provided post candidates. */
export function getCandidateIds(candidates: PostCandidate[]) {
    return candidates.map(c => c.id)
}

/** Hydrate the posts, transfer the metadata of the candidate to the posts. */
export async function hydratePostsWithMeta(candidates: PostCandidate[], user: User) {
    const hydratedPosts = await hydratePosts(getCandidateIds(candidates), user);
    addMetaToHydratedPosts(candidates, hydratedPosts);
    return hydratedPosts
}