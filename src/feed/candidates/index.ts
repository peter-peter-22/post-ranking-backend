import { getTableColumns } from "drizzle-orm";
import { User } from "../../db/schema/users";
import { getEmbeddingSimilarityCandidates } from "./embedding";
import { getInNetworkCandidates } from "./inNetwork";
import { getSocialGraphExpansionCandidates } from "./socialGraphExpansion";
import { posts } from "../../db/schema/posts";


/** Selecting candidate posts from all groups */
export async function getCandidates({ user, followedUsers }: { user: User, followedUsers: string[], limit?: number, offset?: number }) {
    const candidates = (
        await Promise.all([
            getInNetworkCandidates({ followedUsers, user }),
            getSocialGraphExpansionCandidates({ followedUsers, user }),
            getEmbeddingSimilarityCandidates({ followedUsers, user })
        ])
    ).flat()
    return candidates
}

const {embedding,...rest} =getTableColumns(posts)
/** The columns those are selected from the post candidates. */
export const candidateColumns=rest