import { eq } from "drizzle-orm";
import { users } from "../schema/users";
import { seedMainUser } from "../seed/users";
import { db } from "..";

/** Delete the main user, the followed user and all of their's belongings then create a new main user.
 * @returns The new main user.
 */
export async function clearMainUser() {
    await Promise.all([
        db.delete(users).where(eq(users.handle, "main-user")),
    ])
    const newMainUser = await seedMainUser()
    console.log("Recreated main users.")
    return newMainUser
}