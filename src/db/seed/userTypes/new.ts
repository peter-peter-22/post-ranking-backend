import { clearMainUser } from "../../reset/clearMainUser";

//** The main user is a new user with no activity. */
export async function mainUserTypeNew() {
    await clearMainUser()
    console.log("Main user type set to \"new\"")
}