import { PostCandidate } from "..";
import { Vector } from "../../../../embedding/updateUserEmbedding";
import { postsCollection, postVectorSearch } from "../../../../weaviate/controllers/posts";
import { maxAge } from "../../filters";

/** Max count of posts. */
const count = 500;

/** Selecting candidate posts those embedding is similar to a provided vector. */
export async function getEmbeddingSimilarityCandidates(embedding:Vector) {

    // Get the similar posts.
    const rows = await postVectorSearch(
        embedding,
        count,
        postsCollection.filter.byProperty("createdAt").greaterThan(maxAge())
    )
    
    // Format the rows.
    const formatted:PostCandidate[]=rows.map(row=>({
        id:row.id,
        source:"EmbeddingSimilarity"
    }))

    return formatted
}