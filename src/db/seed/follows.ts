import { db } from "..";
import { chunkedInsert } from "../chunkedInsert";
import { updateFollowCounts } from "../controllers/posts/engagement/follow/count";
import { follows, FollowToInsert } from "../schema/follows";
import { User } from "../schema/users";

/** Chance to follow when the follower is interested in a topic of the followable */
const chanceToFollowInterest = 0.5
/** Default chance to follow */
const basicChanceToFollow = 0.05

/**
 * Creates organic follows between the users.
 * 
 * @param users all possibble followers
 * @param posts all possibble followeds
 * @returns array of follows
 * @todo follow users based on post count or engagements
 */
function createRandomFollows(from: User[], to: User[]): FollowToInsert[] {
    return from.flatMap(user => createRandomFollowsForUser(user, to));
}

/**
 * Creates the organic follows of a selected user.
 * 
 * @param user the user who makes the follows
 * @param followables all followable users
 * @returns array of follows
 */
function createRandomFollowsForUser(user: User, followables: User[]): FollowToInsert[] {
    const follows: FollowToInsert[] = [];
    followables.forEach(followable => {
        /** true if the followable user has at least one topic the follower is interested about */
        const isInterested = user.interests.some(interest => followable.interests.includes(interest))
        const follow = Math.random() < (isInterested ? chanceToFollowInterest : basicChanceToFollow)
        if (follow)
            follows.push({
                followerId: user.id,
                followedId: followable.id
            })
    })
    return follows
}

export async function seedFollows({ from, to }: { from: User[], to: User[] }) {
    const followsToInsert = createRandomFollows(from, to)
    await chunkedInsert(followsToInsert, async data => {
        await db.insert(follows)
            .values(data)
            .onConflictDoNothing();
    })
    await updateFollowCounts()
    console.log(`Created ${followsToInsert.length} follows`)
}