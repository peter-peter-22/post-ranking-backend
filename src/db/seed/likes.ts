import { db } from "..";
import { updateLikeCounts } from "../controllers/posts/engagement/like/count";
import { likes, LikeToInsert } from "../schema/likes";
import { Post, posts } from "../schema/posts";
import { User, users } from "../schema/users";
import { getAllBots, isEngaging } from "./utils";

/**
 * Creates organic likes for all posts.
 * 
 * @param users all users who can cast likes
 * @param posts all likable posts
 * @returns array of likes
 */
function createRandomLikes(users: User[], posts: Post[]): LikeToInsert[] {
    return users.flatMap(user => createRandomLikesForUser(user, posts));
}

/**
 * Creates the organic likes of a selected user.
 * The reach of the posts is not taken into account.
 * 
 * @param user the user who casts likes
 * @param posts all likable posts
 * @returns array of likes
 */
function createRandomLikesForUser(user: User, posts: Post[]): LikeToInsert[] {
    const likes: LikeToInsert[] = [];
    posts.forEach(post => {
        if (isEngaging({ post, user }))
            likes.push({
                postId: post.id,
                userId: user.id
            })
    })
    return likes
}


/**Create organic likes for all posts*/
export async function seedLikes() {
    const allBots = await getAllBots()
    const allPosts = await db.select().from(posts);
    const likesToInsert = createRandomLikes(allBots, allPosts)
    await db.insert(likes)
        .values(likesToInsert)
        .onConflictDoNothing();
    await updateLikeCounts()
    console.log(`Created ${likesToInsert.length} likes`)
}