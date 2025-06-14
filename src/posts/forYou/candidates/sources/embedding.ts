import { Vector } from "../../../../embedding/updateUserEmbedding";
import { maxAge } from "../../../filters";
import { PostCandidate } from "../../../common";

/** Max count of posts. */
const count = 500;

/** Selecting candidate posts those embedding is similar to a provided vector. */
export async function getEmbeddingSimilarityCandidates({ vector, followedUsers, skipIds }: { vector: Vector, followedUsers: string[], skipIds?: string[] }) {

    //// Get the similar posts.
    //const rows = await postVectorSearch(
    //    vector,
    //    count,
    //    postsCollection.filter.byProperty("createdAt").greaterThan(maxAge())
    //)
    //
    //// Format the rows.
    //const formatted: PostCandidate[] = rows.map(row => ({
    //    id: row.id,
    //    source: "EmbeddingSimilarity"
    //}))

    //return formatted
}