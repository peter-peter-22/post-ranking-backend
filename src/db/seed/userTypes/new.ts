import { clearMainUser } from "./clearMainUser";

//** The main user in a new user with no activity. */
export async function mainUserTypeNew() {
    await clearMainUser()
    console.log("Main user type set to \"new\"")
}