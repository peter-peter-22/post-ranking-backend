import { SQL } from "drizzle-orm"
import { getFollowedUsers } from "../../db/controllers/users/getFollowers"
import { Post } from "../../db/schema/posts"
import { User } from "../../db/schema/users"
import { CandidateSubquery } from "../feed/candidates"
import { deduplicatePosts, fetchCandidates } from "../feed/candidates/fetchPosts"
import { getTrendCandidates } from "../feed/candidates/sources/trending"
import { commonFilters } from "../feed/filters"
import { getPostEmbeddingSimilarityCandidates } from "./candidates/embedding"

export type RelevantPostsCandidateCommonData = {
    user: User,
    followedUsers: string[],
    commonFilters: SQL[],
    post: Post
}

/** Get values those are shared by multiple relevant candidate selectors. */
export async function getCommonData(user: User, post: Post): Promise<RelevantPostsCandidateCommonData> {
    const followedUsers = await getFollowedUsers({ user })
    return {
        user,
        followedUsers,
        commonFilters: commonFilters(),
        post
    }
}

/** Selecting candidate posts from all groups */
export async function getCandidates(common: RelevantPostsCandidateCommonData) {
    // Get the trends.
    const trends = common.post.keywords

    // Get the subqueries of the candidate sources and union them
    const candidateSqs: CandidateSubquery[] = []

    // Embedding
    const embeddingSq = getPostEmbeddingSimilarityCandidates(common)
    if (embeddingSq)
        candidateSqs.push(embeddingSq)
    // Same keywords
    if (trends) {
        const trendingSqs = getTrendCandidates(common, trends)
        for (const sq of trendingSqs)
            candidateSqs.push(sq)
    }

    // Process candidates
    return deduplicatePosts(await fetchCandidates(candidateSqs))
}