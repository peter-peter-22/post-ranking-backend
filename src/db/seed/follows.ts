import { db } from "..";
import { updateFollowCounts } from "../controllers/follow/count";
import { follows } from "../schema/follows";
import { users } from "../schema/users";

function createRandomFollows(users: { id: string }[]): { followerId: string, followedId: string } {
    return {
        followerId: users[Math.floor(Math.random() * users.length)].id,
        followedId: users[Math.floor(Math.random() * users.length)].id,
    };
}

export async function seedFollows(count: number) {
    const allUsers = await db.select().from(users);
    const followsToInsert = Array(count).fill(null).map(() => createRandomFollows(allUsers))
    await db.insert(follows)
        .values(followsToInsert)
        .onConflictDoNothing();
    updateFollowCounts(undefined)
}