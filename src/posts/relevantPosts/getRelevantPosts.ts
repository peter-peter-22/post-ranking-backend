import { eq } from "drizzle-orm";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { HttpError } from "../../middlewares/errorHandler";
import { CandidateSubquery, deduplicatePosts } from "../common";
import { fetchCandidates } from "../forYou/candidates/fetchPosts";
import { getTrendCandidates } from "../forYou/candidates/sources/trending";
import { rankPosts } from "../forYou/ranker";
import { hydratePostsWithMeta } from "../hydratePosts";
import { getPostEmbeddingSimilarityCandidates } from "./candidates/embedding";

/** Get posts from the main feed of a user. */
export async function getRelevantPosts({ user, postId, skipIds }: { user: User, postId: string, skipIds?: string[] }) {
    // Select the main post
    const [post] = await db.select().from(posts).where(eq(posts.id, postId))
    if (!post)
        throw new HttpError(404, "Post not found")

    // Get the subqueries of the candidate sources and union them
    const candidateSqs: CandidateSubquery[] = []

    // Same keywords
    const keywords = post.keywords
    if (keywords) {
        const trendingSqs = getTrendCandidates({ trends: keywords, skipIds })
        for (const sq of trendingSqs)
            candidateSqs.push(sq)
    }
    // Embedding
    if (post.embedding)
        candidateSqs.push(getPostEmbeddingSimilarityCandidates(post.embedding, skipIds))

    // Fetch and deduplicate
    let candidates = deduplicatePosts(await fetchCandidates(candidateSqs))
    // Remove the main post from the candidate list
    candidates = candidates.filter(p => p.id !== postId)
    // Hydrate
    const postsToRank = await hydratePostsWithMeta(candidates, user)
    // Rank
    return await rankPosts(postsToRank)
}