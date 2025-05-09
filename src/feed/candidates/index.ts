import { cosineDistance, getTableColumns, sql, SQL } from "drizzle-orm";
import { getFollowedUsers } from "../../db/controllers/users/getFollowers";
import { Post, posts } from "../../db/schema/posts";
import { User, UserCommon, users } from "../../db/schema/users";
import { getEmbeddingSimilarityCandidates } from "./sources/embedding";
import { getInNetworkCandidates } from "./sources/inNetwork";
import { getGraphClusterCandidates } from "./sources/graphCluster";
import { commonFilters } from "../../db/controllers/posts/filters";
import { getTrendCandidates } from "./sources/trending";
import { deDuplicateCandidates } from "./filters";

/** Selecting candidate posts from all groups */
export async function getCandidates(common: CandidateCommonData) {
    // Get the candidates.
    let candidates = (
        await Promise.all([
            getInNetworkCandidates(common),
            getGraphClusterCandidates(common),
            getEmbeddingSimilarityCandidates(common),
            getTrendCandidates(common)
        ])
    ).flat()

    // Deduplicate.
    candidates = deDuplicateCandidates(candidates)

    return candidates
}

const { embedding, ...rest } = getTableColumns(posts)

/** The columns those are selected from the post candidates. */
export function candidateColumns(user: User) {
    return {
        ...rest,
        similarity: user.embedding ? sql<number>`1 - (${cosineDistance(posts.embedding, user.embedding)})` : sql<number>`0`
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
export type CandidateSource = "InNetwork" | "GraphClusters" | "EmbeddingSimilarity" | "Trending"

/** Post returned by the candidate selectors. */
export type CandidatePost = Omit<Post, "embedding"> & { candidateSource: CandidateSource }

/** Set the candidate source on a array of posts. */
export function setCandidatesType(candidates: Omit<CandidatePost, "candidateSource">[], type: CandidateSource): CandidatePost[] {
    return candidates.map(post => ({ ...post, candidateSource: type }));
}