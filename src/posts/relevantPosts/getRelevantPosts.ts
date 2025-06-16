import { eq } from "drizzle-orm";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { fetchCandidates } from "../forYou/candidates/fetchPosts";
import { getTrendCandidates } from "../forYou/candidates/sources/trending";
import { CandidateSubquery, deduplicatePosts } from "../common";
import { rankPosts } from "../forYou/ranker";
import { getCandidateIds, hydratePosts } from "../hydratePosts";
import { getPostEmbeddingSimilarityCandidates } from "./candidates/embedding";

/** Get posts from the main feed of a user. */
export async function getRelevantPosts({ user, postId, skipIds }: { user: User, postId: string, skipIds?: string[] }) {
    // Select the main post
    const [post] = await db.select().from(posts).where(eq(posts.id, postId))
    if (!post)
        throw new Error("Post not found")

    // Get the subqueries of the candidate sources and union them
    const candidateSqs: CandidateSubquery[] = []
    // Promises to fetch the candidates
    const promises = []

    // Same keywords
    const keywords = post.keywords
    if (keywords) {
        const trendingSqs = getTrendCandidates({ trends: keywords, skipIds })
        for (const sq of trendingSqs)
            candidateSqs.push(sq)
    }
    // Embedding
    if (post.embedding)
        promises.push(getPostEmbeddingSimilarityCandidates(post.embedding, skipIds))

    // Fetch candidates from the database
    promises.push(fetchCandidates(candidateSqs))

    // Await the promises to get all candidates
    const allCandidates = (await Promise.all(promises)).flat()
    // Deduplicate
    let candidates = deduplicatePosts(allCandidates)
    // Remove the main post from the candidate list
    candidates = candidates.filter(p => p.id !== postId)
    // Hydrate
    const postsToRank = await hydratePosts(getCandidateIds(candidates), user)
    // Rank
    return await rankPosts(postsToRank)
}