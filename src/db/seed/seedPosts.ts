import { db } from "..";
import { faker } from '@faker-js/faker';
import { users } from "../schema/users";
import { posts } from "../schema/posts";

function createRandomPost(users: { id: string }[]): { userId: string, text: string } {
    return {
        userId: users[Math.floor(Math.random() * users.length)].id,
        text: faker.lorem.paragraphs(3),
    };
}

export async function seedPosts(count: number) {
    const allUsers = await db.select().from(users);
    const postsToInsert = Array(count).fill(null).map(() => createRandomPost(allUsers))
    await db.insert(posts)
        .values(postsToInsert)
        .onConflictDoNothing();
}