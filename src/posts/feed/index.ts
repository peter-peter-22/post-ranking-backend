import { User } from "../../db/schema/users";
import { getCandidates, getCommonData } from "./candidates";
import { rankPosts } from "./ranker";

/** Get posts from the main feed of a user. */
export async function getFeed({ user }: { user: User, limit?: number, offset?: number }) {
    const common=await getCommonData(user)
    const candidates = await getCandidates(common)
    const finalPosts=await rankPosts(candidates)
    return finalPosts
}