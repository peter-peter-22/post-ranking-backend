import axios from "axios";
import { env } from "../zod/env";

// Create axios instance for the embedding api
const embeddingApi = axios.create({
    baseURL: env.EMBEDDING_API_URL,
})

/** Convert texts to embedding vectors via the embedding vector server.
 * @param texts The texts to convert.
 * @returns Embedding vectors.
 */
export async function generateEmbeddingVectors(texts: string[]) {
    try {
        const res = await embeddingApi.post("/embedding", { texts: texts })
        return res.data.embeddings
    }
    catch (err) {
        throw new Error(`Failed to generate embedding vectors. Error: "${err instanceof Error ? err.message : err}"`)
    }
}