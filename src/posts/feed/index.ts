import { User } from "../../db/schema/users";
import { HydratedPost, hydratePostsWithSources } from "../hydratePosts";
import { getCandidates, getCommonData, PostCandidate } from "./candidates";
import { rankPosts } from "./ranker";

/** Get posts from the main feed of a user. */
export async function getFeed({ user }: { user: User }) {
    const common = await getCommonData(user)
    const candidates = await getCandidates(common)
    let finalPosts = await hydratePostsWithSources(candidates, user)
    return await rankPosts(finalPosts)
}

/** Convert hydrated posts to post candidates. */
export function dehydratePosts(posts: HydratedPost[]): PostCandidate[] {
    return posts.map(p => ({
        id: p.id,
        source: p.source
    }))
}