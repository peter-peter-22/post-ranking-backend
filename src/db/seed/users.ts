import { db } from "..";
import { faker } from '@faker-js/faker';
import { users, UserToInsert } from "../schema/users";
import { topics } from "../../bots/examplePosts";

const mainUser = { handle: "main-user", name: "Main User" }

function createRandomUser(): UserToInsert {
    return {
        handle: faker.internet.username(),
        name: faker.person.fullName(),
        interests: Array(1).fill(null).map(() => randomTopic()),
        bot: true
    };
}

export async function seedUsers(count: number) {
    const usersToInsert = Array(count).fill(null).map(() => createRandomUser())
    const allBots=await db.insert(users)
        .values(usersToInsert)
        .onConflictDoNothing()
        .returning();
    console.log(`Created ${count} users`)
    return allBots
}

/**
 * Create the main user with it's specified handle and name.
 * @returns The user object
 */
export async function seedMainUser() {
    const [user] = await db.insert(users)
        .values(mainUser)
        .onConflictDoNothing()
        .returning();
    console.log("Created main user")
    return user;
}

export function randomTopic() {
    return topics[Math.floor(Math.random() * topics.length)]
}