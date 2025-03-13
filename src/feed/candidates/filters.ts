import { CandidatePost } from ".";

/** Remove the duplicated posts. */
export function deDuplicateCandidates(posts: CandidatePost[]) {
    const uniqueIds = new Set();
    return posts.filter(post => {
        if (!uniqueIds.has(post.id)) {
            uniqueIds.add(post.id);
            return true;
        }
        return false;
    });
}