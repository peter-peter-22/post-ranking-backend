import { eq } from "drizzle-orm";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { HttpError } from "../../middlewares/errorHandler";
import { CandidateSubquery } from "../common";
import { getTrendCandidates } from "../forYou/candidates/trending";
import { rankPosts } from "../ranker";
import { personalizePosts } from "../hydratePosts";
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

    // Fetch
    const postsToRank = await personalizePosts(candidateSqs[0],user)
    // Remove the main post 
    const mainPostIndex=postsToRank.findIndex(p => p.id !== postId)
    if(mainPostIndex!==-1) 
        postsToRank.splice(mainPostIndex, 1)
    // Rank
    return await rankPosts(postsToRank)
}