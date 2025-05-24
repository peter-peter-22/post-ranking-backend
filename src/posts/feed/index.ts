import { User } from "../../db/schema/users";
import { hydratePosts } from "../hydratePosts";
import { getCandidates, getCommonData } from "./candidates";
import { rankPosts } from "./ranker";

/** Get posts from the main feed of a user. */
export async function getFeed({ user }: { user: User}) {
    const common = await getCommonData(user)
    const candidates = await getCandidates(common)
    let finalPosts = await hydratePosts(candidates, user)
    return await rankPosts(finalPosts)
}