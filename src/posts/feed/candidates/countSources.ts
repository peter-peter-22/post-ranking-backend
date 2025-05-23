import { PostToDisplay } from "./fetchPosts";

/** Count the number of posts per candidate source. */
export function countCandidateSources(posts:PostToDisplay[]){
    const candidateSourceCounts = new Map<string, number>();
    posts.forEach(post=>{
        const count=candidateSourceCounts.get(post.candidateType)||0
        candidateSourceCounts.set(post.candidateType,count+1)
    })
    return candidateSourceCounts
}