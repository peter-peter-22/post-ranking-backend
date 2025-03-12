import { getTableColumns, SQL } from "drizzle-orm";
import { getFollowedUsers } from "../../db/controllers/users/getFollowers";
import { Post, posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { getEmbeddingSimilarityCandidates } from "./embedding";
import { getInNetworkCandidates } from "./inNetwork";
import { getGraphClusterCandidates } from "./graphCluster";
import { commonFilters } from "../filters";

/** Selecting candidate posts from all groups */
export async function getCandidates(common: CandidateCommonData) {
    const candidates = (
        await Promise.all([
            getInNetworkCandidates(common),
            getGraphClusterCandidates(common),
            getEmbeddingSimilarityCandidates(common)
        ])
    ).flat()
    return candidates
}

const { embedding, ...rest } = getTableColumns(posts)
/** The columns those are selected from the post candidates. */
export const candidateColumns = rest

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

/** Post returned by the candidate selectors. */
export type CandidatePost = Omit<Post, "embedding">