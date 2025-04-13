import { db } from "..";
import { chunkedInsert } from "../chunkedInsert";
import { updateFollowCounts } from "../controllers/posts/engagement/follow/count";
import { follows, FollowToInsert } from "../schema/follows";
import { UserCommon } from "../schema/users";

/** Chance to follow when the follower is interested in a topic of the followable */
const chanceToFollowInterest = 0.5
/** Default chance to follow */
const chanceToFollowIrrelevant = 0.05

/**
 * Create organic follows between the users and insert them into the DB.
 * 
 * @param users all possibble followers
 * @param posts all possibble followeds
 * @returns array of follows
 */
async function createRandomFollows(from: UserCommon[], to: UserCommon[]) {
    console.log(`Creating follows. Max results: ${from.length * to.length}`)
    /** The total count of the inserted rows. */
    let count = 0
    for (let i = 0; i < from.length; i++) {
        const user = from[i];
        // Log progress per 100 users to avoid flooding the console
        if(i%100===0)
            console.log(`Processing user ${i + 1} of ${from.length}`);
        // Create the follows
        const followsToInsert = createRandomFollowsForUser(user, to)
        // Track the total count
        count += followsToInsert.length
        // Insert the follows after creating them insted of inserting them later to avoid memory issues
        await chunkedInsert(followsToInsert, async data => {
            await db.insert(follows)
                .values(data)
                .onConflictDoNothing();
        })
    };
    console.log(`Created ${count} follows`)
}

/**
 * Creates the organic follows of a selected user.
 * 
 * @param user the user who makes the follows
 * @param followables all followable users
 * @returns array of follows
 */
function createRandomFollowsForUser(user: UserCommon, followables: UserCommon[]): FollowToInsert[] {
    const follows: FollowToInsert[] = [];
    followables.forEach(followable => {
        /** true if the followable user has at least one topic the follower is interested about */
        const isInterested = user.interests.some(interest => followable.interests.includes(interest))
        const follow = Math.random() < (isInterested ? chanceToFollowInterest : chanceToFollowIrrelevant)
        if (follow)
            follows.push({
                followerId: user.id,
                followedId: followable.id
            })
    })
    return follows
}

export async function seedFollows({ from, to }: { from: UserCommon[], to: UserCommon[] }) {
    await createRandomFollows(from, to)
    await updateFollowCounts()
}