import { sql, SQL } from "drizzle-orm";
import { getFollowedUsers } from "../../../db/controllers/users/getFollowers";
import { posts } from "../../../db/schema/posts";
import { User } from "../../../db/schema/users";
import { getTrendNames } from "../../../trends/getTrends";
import { commonFilters } from "../filters";
import { deduplicatePosts, fetchCandidates } from "./fetchPosts";
import { getEmbeddingSimilarityCandidates } from "./sources/embedding";
import { getFollowedCandidates } from "./sources/followed";
import { getGraphClusterCandidates } from "./sources/graphCluster";
import { getRepliedByFollowedCandidates } from "./sources/repliedByFollowed";
import { getTrendCandidates } from "./sources/trending";

/** Selecting candidate posts from all groups */
export async function getCandidates(common: CandidateCommonData) {
    // Get the trends.
    const trends = await getTrendNames(common.user.clusterId)

    // Get the subqueries of the candidate sources and union them
    const candidateSqs:CandidateSubquery[]=[]
    
    // Followed
    candidateSqs.push(getFollowedCandidates(common))
    // Replied by followed
    candidateSqs.push(getRepliedByFollowedCandidates(common))
    // Graph cluster
    const graphClusterSq = getGraphClusterCandidates(common)
    if (graphClusterSq)
        candidateSqs.push(graphClusterSq)
    // Embedding
    const embeddingSq = getEmbeddingSimilarityCandidates(common)
    if (embeddingSq)
        candidateSqs.push(embeddingSq)
    // Trending
    const trendingSqs = getTrendCandidates(common, trends)
    for (const sq of trendingSqs)
        candidateSqs.push(sq)

    // Process candidates
    return deduplicatePosts(await fetchCandidates(candidateSqs))
}

/** Post id with candidate source. */
export type PostCandidate = Awaited<ReturnType<typeof getCandidates>>[number]

/** A candidate selector subquery. */
export type CandidateSubquery = ReturnType<typeof getFollowedCandidates>

/** The columns those are selected from the post candidates. */
export function candidateColumns(candidateType: CandidateSource) {
    return {
        id:posts.id,
        source: sql<CandidateSource>`${candidateType}`.as("candidate_type"),
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
export type CandidateSource = "Followed" | "RepliedByFollowed" | "GraphClusters" | "EmbeddingSimilarity" | "Trending" | "Rest" | "Publisher" | "Unknown"
