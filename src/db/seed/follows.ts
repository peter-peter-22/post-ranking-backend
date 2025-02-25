import { db } from "..";
import { updateFollowCounts } from "../controllers/follow/count";
import { getAllBots } from "./utils";
import { follows } from "../schema/follows";

function createRandomFollows(users: { id: string }[]): { followerId: string, followedId: string } {
    return {
        followerId: users[Math.floor(Math.random() * users.length)].id,
        followedId: users[Math.floor(Math.random() * users.length)].id,
    };
}

export async function seedFollows(count: number) {
    const allBots = await getAllBots();
    const followsToInsert = Array(count).fill(null).map(() => createRandomFollows(allBots))
    await db.insert(follows)
        .values(followsToInsert)
        .onConflictDoNothing();
    updateFollowCounts(undefined)
    console.log(`Created ${count} follows`)
}