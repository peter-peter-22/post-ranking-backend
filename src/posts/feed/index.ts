import { User } from "../../db/schema/users";
import { HydratedPost, hydratePostsWithMeta } from "../hydratePosts";
import { getCandidates, getCommonData, PostCandidate } from "./candidates";
import { rankPosts } from "./ranker";

/** Get posts from the main feed of a user. */
export async function getFeed({ user, skipIds }: { user: User, skipIds?: string[] }) {
    const common = await getCommonData(user, skipIds)
    const candidates = await getCandidates(common)
    let finalPosts = await hydratePostsWithMeta(candidates, user)
    return await rankPosts(finalPosts)
}

/** Convert hydrated posts to post candidates. */
export function dehydratePosts(posts: HydratedPost[]): PostCandidate[] {
    return posts.map(p => ({
        id: p.id,
        source: p.source,
        score: p.score
    }))
}

/** Get the first page of posts and keep them hydrated while dehydrating the others to prevent an additional fetch for the first hydration. */
export function preparePosts(posts: HydratedPost[], postsPerPage: number) {
    const firstPage = posts.slice(0, postsPerPage)
    const rest = posts.slice(postsPerPage)
    const dehydrated = dehydratePosts(rest)
    return { hydrated: firstPage, dehydrated }
}