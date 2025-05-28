import { Vector } from "../../../embedding/updateUserEmbedding";
import { postsCollection, postVectorSearch } from "../../../weaviate/controllers/posts";
import { PostCandidate } from "../../feed/candidates";
import { maxAge } from "../../feed/filters";

/** Max count of posts. */
const count = 500;
/** Maximum cosine distance of the selected posts */
const maxDistance = 0.5

/** Selecting candidate posts those embedding is similar to a provided vector, with a minimum threshold. */
export async function getPostEmbeddingSimilarityCandidates(embedding:Vector) {

    // Get the similar posts.
    const rows = await postVectorSearch(
        embedding,
        count,
        postsCollection.filter.byProperty("createdAt").greaterThan(maxAge()),
        maxDistance
    )
    
    // Format the rows.
    const formatted:PostCandidate[]=rows.map(row=>({
        id:row.id,
        source:"EmbeddingSimilarity"
    }))

    return formatted
}