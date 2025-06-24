import { getTableColumns, sql } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { posts } from "../db/schema/posts"

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
const exampleQuery = db.select(candidateColumns("Unknown")).from(posts).$dynamic()
export type CandidateSubquery = typeof exampleQuery

/** The columns those are selected from the post candidates. */
export function candidateColumns(candidateType: CandidateSource) {
    return {
        ...getTableColumns(posts),
        source: sql<CandidateSource>`${candidateType}::string`.as("candidate_type"),
    }
}

/** Count the number of posts per candidate source. */
export function countCandidateSources(posts: PostCandidate[]) {
    const candidateSourceCounts = new Map<CandidateSource, number>();
    posts.forEach(post => {
        const source = post.source || "Unknown"
        const count = candidateSourceCounts.get(source) || 0
        candidateSourceCounts.set(source, count + 1)
    })
    return candidateSourceCounts
}

export const BasicFeedSchema = z.object({
    offset: z.number().default(0)
})

export type DatePageParams = {
    skipStart: string,
    skipEnd: string
}