import { faker } from '@faker-js/faker';
import { examplePosts } from '../../bots/examplePosts';
import { createPosts } from '../../user_actions/createPost';
import { PostToCreate } from "../schema/posts";
import { UserCommon } from '../schema/users';
import { getAllBots } from './utils';

/**
 * Returns a post with random values.
 * 
 * @param users possible publishers
 * @returns post to insert
 */
function createRandomPostFromRandomUser(users: UserCommon[]): PostToCreate {
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
export function createRandomPost(user: UserCommon): PostToCreate {
    //random topic from the selected user
    const topic = user.interests[Math.floor(Math.random() * user.interests.length)]

    return {
        userId: user.id,
        text: generatePostText(topic),
        topic: topic,
        engaging: Math.random(),
        createdAt: faker.date.recent({ days: 3 })
    };
}

function generatePostText(topic: string) {
    const group = examplePosts[topic]
    if (!group)
        throw new Error(`The topic "${topic}" does not exists!`)
    return group[Math.floor(Math.random() * group.length)]
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
    const allPosts = await createPosts(postsToInsert)
    console.log(`Created ${count} posts`)
    return allPosts;
}