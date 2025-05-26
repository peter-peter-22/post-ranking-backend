import { aliasedTable, and, cosineDistance, eq, exists, inArray, sql } from "drizzle-orm"
import { db } from "../db"
import { engagementHistory } from "../db/schema/engagementHistory"
import { follows } from "../db/schema_pending/follows"
import { likes } from "../db/schema/likes"
import { posts } from "../db/schema/posts"
import { User, users } from "../db/schema/users"
import { CandidateSource, PostCandidate } from "./feed/candidates"

/** Use an array of post ids to fetch posts and their data. */
export async function hydratePosts(candidates: PostCandidate[], user: User) {

    // With query to get the posts of the provided ids
    const hydratePosts = db.$with("post_ids_to_hydrate").as(
        db
            .select()
            .from(posts)
            .where(inArray(posts.id, candidates.map(c => c.id)))
    )

    // Followed by viewer
    const isFollowedSq = exists(db
        .select()
        .from(follows)
        .where(and(
            eq(follows.followerId, user.id),
            eq(follows.followedId, hydratePosts.userId)
        ))

    ).as<boolean>("followed_by_viewer")

    // Replied by followed user
    const replies = aliasedTable(posts, "replies")
    const isRepliedByFollowedSq = exists(db
        .select()
        .from(replies)
        .where(and(
            eq(replies.replyingTo, hydratePosts.id),
        ))
        .innerJoin(follows, and(
            eq(follows.followedId, replies.userId),
            eq(follows.followerId, user.id)
        ))
    ).as<boolean>("replied_by_followed")

    // Liked by viewer
    const likedByViewerSq = exists(db
        .select()
        .from(likes)
        .where(and(
            eq(likes.postId, hydratePosts.id),
            eq(likes.userId, user.id)
        ))
    ).as<boolean>("liked_by_viewer")

    // Embedding similarty between the viewer and the post
    const similarity = (user.embedding ? sql<number>`1 - (${cosineDistance(posts.embedding, user.embedding)})` : sql<number>`0`).as("embedding_similarity")

    // Fetch
    const hydratedPosts = await db
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
            engagementHistory: engagementHistory,
            followed: isFollowedSq,
            repliedByFollowed: isRepliedByFollowedSq,
            liked: likedByViewerSq,
            user: users,
            media: hydratePosts.media,
            //debug
            keywords: hydratePosts.keywords,
            embeddingText: hydratePosts.embeddingText,
            commentScore: hydratePosts.commentScore,
            source: sql<CandidateSource>`'Unknown'`.as("candidate_type"),
        })
        .from(hydratePosts)
        .innerJoin(users, eq(users.id, hydratePosts.userId))
        .leftJoin(engagementHistory, and(
            eq(engagementHistory.viewerId, user.id),
            eq(engagementHistory.publisherId, hydratePosts.userId)
        ))

    // Create a map of ids and candidate sources
    const idMap: Map<string, CandidateSource> = new Map()
    candidates.forEach(c => {
        idMap.set(c.id, c.source)
    });

    // Set the candidate sources of the posts
    hydratedPosts.forEach(post => {
        post.source = idMap.get(post.id) || "Unknown"
    })

    return hydratedPosts
}

export type HydratedPost = Awaited<ReturnType<typeof hydratePosts>>[number];