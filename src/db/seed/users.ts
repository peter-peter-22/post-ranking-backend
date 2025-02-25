import { db } from "..";
import { faker } from '@faker-js/faker';
import { users, UserToInsert } from "../schema/users";

const mainUser = { handle: "main-user", name: "Main User" }

function createRandomUser(): UserToInsert {
    return {
        handle: faker.internet.username(),
        name: faker.person.fullName(),
        interests: Array(2).fill(null).map(() => randomTopic()),
        bot: true
    };
}

export async function seedUsers(count: number) {
    const usersToInsert = Array(count).fill(null).map(() => createRandomUser())
    await db.insert(users)
        .values(usersToInsert)
        .onConflictDoNothing();
    console.log(`Created ${count} users`)
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

export const topics = [
    "cars",
    "sports",
    "technology",
    "music",
    "popculture",
    "animals",
    "games",
    "movies"
]

export function randomTopic() {
    return topics[Math.floor(Math.random() * topics.length)]
}