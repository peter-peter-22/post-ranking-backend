import { z } from "zod"
import { HydratedPost } from "./hydratePosts"
import { getFollowedCandidates } from "./forYou/candidates/sources/followed"
import { sql } from "drizzle-orm"
import { posts } from "../db/schema/posts"

/** Convert hydrated posts to post candidates. */
export function dehydratePosts(posts: HydratedPost[]): PostCandidate[] {
    return posts.map(p => ({
        id: p.id,
        source: p.source,
        score: p.score
    }))
}

/** Get the first page of posts and keep them hydrated while dehydrating the others to prevent an additional fetch for the first hydration. */
export function splitPosts(posts: HydratedPost[], postsPerPage: number) {
    const firstPage = posts.slice(0, postsPerPage)
    const rest = posts.slice(postsPerPage)
    const dehydrated = dehydratePosts(rest)
    return { hydrated: firstPage, dehydrated }
}

/** The type of the post candidate. */
export const CandidateSourceSchema = z.enum(["Followed", "RepliedByFollowed", "GraphClusters", "EmbeddingSimilarity", "Trending", "Rest", "Publisher", "Unknown"])

export type CandidateSource = z.infer<typeof CandidateSourceSchema>

/** Post id with candidate source. */
export const PostCandidateSchema = z.object({
    id: z.string(),
    source: CandidateSourceSchema.optional(),
    score: z.number().optional(),
})

export type PostCandidate = z.infer<typeof PostCandidateSchema>

/** A candidate selector subquery. */
export type CandidateSubquery = ReturnType<typeof getFollowedCandidates>

/** The columns those are selected from the post candidates. */
export function candidateColumns(candidateType: CandidateSource) {
    return {
        id: posts.id,
        source: sql<CandidateSource>`${candidateType}::string`.as("candidate_type"),
    }
}

/** Remove posts with duplicated ids. */
export function deduplicatePosts(posts: PostCandidate[]) {
    const seen = new Set<string>();
    const deduplicated= posts.filter(post => {
        if (seen.has(post.id))
            return false;
        else {
            seen.add(post.id);
            return true;
        }
    })
    console.log("Before deduplication:",countCandidateSources(posts),"After deduplication:",countCandidateSources(deduplicated))
    return deduplicated
}

/** Count the number of posts per candidate source. */
export function countCandidateSources(posts:PostCandidate[]){
    const candidateSourceCounts = new Map<CandidateSource, number>();
    posts.forEach(post=>{
        const source=post.source||"Unknown"
        const count=candidateSourceCounts.get(source)||0
        candidateSourceCounts.set(source,count+1)
    })
    return candidateSourceCounts
}

export const BasicFeedSchema = z.object({
    skipIds: z.array(z.string()).optional(),
    limit: z.number()
})