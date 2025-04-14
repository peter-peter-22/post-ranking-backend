import { db } from "../..";
import { follows } from "../../schema/follows";

/** Get a nested map of follow relationships. */
async function getFollowMap() {
    // Get the follows from the db
    const allFollows = await db.select().from(follows);

    const followMap = new Map<string, Set<string>>();

    // Build the nested map
    allFollows.forEach(follow => {
        if (!followMap.has(follow.followerId)) {
            followMap.set(follow.followerId, new Set<string>());
        }
        followMap.get(follow.followerId)?.add(follow.followedId);
    });

    return followMap
}

/**
 * Fetch the follow relationships for all users and create a function that checks if a user follows another user.
 if a user follows another user.
 * @returns A function that checks if a user follows another user.
 */
export async function getFollowChecker() {
    const followMap = await getFollowMap()
    return (followerId: string, followedId: string) => {
        // Check if the followerId exists in the map
        if (followMap.has(followerId)) {
            const followedSet = followMap.get(followerId);
            // Check if the followedId exists in the set
            return followedSet?.has(followedId) || false;
        }
        return false; // FollowerId doesn't exist in the map
    }
}