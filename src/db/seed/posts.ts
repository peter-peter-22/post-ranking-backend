import { faker } from '@faker-js/faker';
import { db } from "..";
import { getAllBots } from './utils';
import { posts, PostToInsert } from "../schema/posts";

/**
 * Returns a post with random values.
 * 
 * @param users possible publishers
 * @returns array of posts
 */
function createRandomPost(users: { id: string, interests: string[] }[]): PostToInsert {

    //randomly selected user
    const user = users[Math.floor(Math.random() * users.length)];

    //random topic from the selected user
    const topic = user.interests[Math.floor(Math.random() * user.interests.length)]

    return {
        userId: user.id,
        text: `This post is about ${topic}.\n${faker.lorem.paragraphs(1)}`,
        topic: topic,
        engaging: randomEngaging(),
        createdAt: faker.date.recent({ days: 10 })
    };
}

/**
 * Creates random posts using the accounts of the bot users.
 * The topic of the posts is relevant to the topic of the publisher.
 * 
 * @param count the count of the generated posts
 */
export async function seedPosts(count: number) {
    const allBots = await getAllBots()
    const postsToInsert = Array(count).fill(null).map(() => createRandomPost(allBots))
    await db.insert(posts)
        .values(postsToInsert)
        .onConflictDoNothing();
    console.log(`Created ${count} posts`)
}

/**
 * Generates a random engagement modifier for a post. 
 * This defines how much chance the bots have to interact with the post.
 *
 * @returns number between 0 and 1
 */
function randomEngaging(): number {
    return Math.random()
}