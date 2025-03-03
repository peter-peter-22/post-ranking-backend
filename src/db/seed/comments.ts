import { faker } from '@faker-js/faker';
import { db } from "..";
import { getAllBots, isEngaging } from './utils';
import { Post, posts, PostToInsert } from "../schema/posts";
import { User } from '../schema/users';
import { updateReplyCounts } from '../controllers/posts/count';


/**
 * Returns organic comments with random values.
 * 
 * @param users possible commenters
 * @param posts posts those can recieve comments
 * @returns array of replies
 */
function createRandomReplies(users: User[], posts: Post[]): PostToInsert[] {
    return users.flatMap(user => createRandomRepliesForUser(user, posts));
}

/**
 * Creates the organic replies of a selected user.
 * The reach of the posts is not taken into account.
 * 
 * @param user the commenter
 * @param posts posts those can recieve comments
 * @returns array of replies made by one user
 */
function createRandomRepliesForUser(user: User, posts: Post[]): PostToInsert[] {
    const postsToInsert: PostToInsert[] = [];
    posts.forEach(post => {
        if (isEngaging({ post, user, multiplier: 0.3 }))
            postsToInsert.push({
                userId: user.id,
                text: `This reply is about ${post.topic}\n${faker.lorem.lines(1)}`,
                topic: post.topic,
                engaging: Math.random(),
                createdAt: faker.date.recent({ days: 10 }),
                replyingTo: post.id
            })
    })
    return postsToInsert
}

/**
 * Creates random replies to all posts using the accounts of the bot users.
 */
export async function seedReplies() {
    const allBots = await getAllBots()
    const allPosts = await db.select().from(posts);
    const repliesToInsert = createRandomReplies(allBots, allPosts)
    await db.insert(posts)
        .values(repliesToInsert)
        .onConflictDoNothing()
    await updateReplyCounts()
    console.log(`Created ${repliesToInsert.length} replies`)
}