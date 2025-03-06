import { eq } from "drizzle-orm";
import { db } from "../..";
import { users } from "../../schema/users";
import { seedMainUser } from "../users";

/** Delete the main user and all of it's belongings then create a new one.
 * @returns The new main user.
 */
export async function clearMainUser() {
    const [mainUser] = await db.select().from(users).where(eq(users.handle, "main-user"))
    await Promise.all([
        db.delete(users).where(eq(users.id, mainUser.id)),
    ])
    const newMainUser = await seedMainUser()
    console.log("Recreated main user.")
    return newMainUser
}