import { CandidateSource } from ".";
import { PostToDisplay } from "./fetchPosts";

/** Count the number of posts per candidate source. */
export function countCandidateSources(posts:PostToDisplay[]){
    const candidateSourceCounts = new Map<CandidateSource, number>();
    posts.forEach(post=>{
        const count=candidateSourceCounts.get(post.source)||0
        candidateSourceCounts.set(post.source,count+1)
    })
    return candidateSourceCounts
}