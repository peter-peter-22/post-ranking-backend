import { faker } from '@faker-js/faker';
import { db } from "..";
import { getAllBots } from './utils';
import { posts, PostToInsert } from "../schema/posts";
import { User } from '../schema/users';

/**
 * Returns a post with random values.
 * 
 * @param users possible publishers
 * @returns post to insert
 */
function createRandomPostFromRandomUser(users: User[]): PostToInsert {
    //randomly selected user
    const user = users[Math.floor(Math.random() * users.length)];
    return createRandomPost(user)
}

/**
 * Returns a post with random values.
 * 
 * @param users the publisher
 * @returns post to insert
 */
export function createRandomPost(user: User) {
    //random topic from the selected user
    const topic = user.interests[Math.floor(Math.random() * user.interests.length)]

    return {
        userId: user.id,
        text: `This post is about ${topic}.\n${faker.lorem.paragraphs(1)}`,
        topic: topic,
        engaging: Math.random(),
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
    const postsToInsert = Array(count).fill(null).map(() => createRandomPostFromRandomUser(allBots))
    const allPosts=await db.insert(posts)
        .values(postsToInsert)
        .onConflictDoNothing()
        .returning();
    console.log(`Created ${count} posts`)
    return allPosts;
}