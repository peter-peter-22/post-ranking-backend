import { db } from "..";
import { updateLikeCounts } from "../controllers/like/count";
import { likes } from "../schema/likes";
import { posts } from "../schema/posts";
import { users } from "../schema/users";

function createRandomLikes(users: { id: string }[], posts: { id: string }[]): { userId: string, postId: string } {
    return {
        userId: users[Math.floor(Math.random() * users.length)].id,
        postId: posts[Math.floor(Math.random() * posts.length)].id,
    };
}

export async function seedLikes(count: number) {
    const allUsers = await db.select().from(users);
    const allPosts = await db.select().from(posts);
    const likesToInsert = Array(count).fill(null).map(() => createRandomLikes(allUsers, allPosts))
    await db.insert(likes)
        .values(likesToInsert)
        .onConflictDoNothing();
    updateLikeCounts(allPosts.map(post => post.id))
        .catch(error => console.error("error while updating likes:", error))
}