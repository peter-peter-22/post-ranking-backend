import { getFollowedUsers } from "../../db/controllers/users/getFollowers";
import { User } from "../../db/schema/users";
import { getInNetworkCandidates } from "./inNetwork";
import { getSocialGraphExpansionCandidates } from "./socialGraphExpansion";


/** Selecting candidate posts from all groups */
export async function getCandidates({ user }: { user: User, limit?: number, offset?: number }) {
    const followedUsers = await getFollowedUsers({ user })
    const candidates = (
        await Promise.all([
            getInNetworkCandidates({ followedUsers, user }),
            getSocialGraphExpansionCandidates({ followedUsers, user })
        ])
    ).flat()
    return candidates
}