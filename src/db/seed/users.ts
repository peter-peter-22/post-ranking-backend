import { db } from "..";
import { faker } from '@faker-js/faker';
import { users } from "../schema/users";

const mainUser = { handle: "main-user", name: "Main User" }

function createRandomUser(): { handle: string, name: string } {
    return {
        handle: faker.internet.username(),
        name: faker.person.fullName(),
    };
}

export async function seedUsers(count: number) {
    const usersToInsert = Array(count).fill(null).map(() => createRandomUser())
    await db.insert(users)
        .values(usersToInsert)
        .onConflictDoNothing();
}

export async function seedMainUser() {
    await db.insert(users)
        .values(mainUser)
        .onConflictDoNothing();
}