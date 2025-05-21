import { User } from "../db/schema/users";
import { getCandidates, getCommonData } from "./candidates";

/** Get posts from the main feed of a user. */
export async function getFeed({ user, limit = 50, offset = 0 }: { user: User, limit?: number, offset?: number }) {
    const common=await getCommonData(user)
    const candidates = await getCandidates(common)
    //const fullPosts = addDataToPosts(candidates,common)
    return candidates
}