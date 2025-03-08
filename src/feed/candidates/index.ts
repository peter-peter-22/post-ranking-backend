import { getTableColumns } from "drizzle-orm";
import { getFollowedUsers } from "../../db/controllers/users/getFollowers";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { getEmbeddingSimilarityCandidates } from "./embedding";
import { getInNetworkCandidates } from "./inNetwork";
import { getSocialGraphExpansionCandidates } from "./socialGraphExpansion";

/** Selecting candidate posts from all groups */
export async function getCandidates({ user }: { user: User, limit?: number, offset?: number }) {
    const common = await getCommonData(user)
    const candidates = (
        await Promise.all([
            getInNetworkCandidates(common),
            getSocialGraphExpansionCandidates(common),
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
    return { user, followedUsers }
}

export type CandidateCommonData = {
    user: User,
    followedUsers: string[]
}