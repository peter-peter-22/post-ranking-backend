import axios from "axios";

// Create axios instance for the embedding api
const embeddingApi = axios.create({
    baseURL: "http://localhost:8000",//@todo: use zod for env
    timeout: 50000000,
})

/** Send a request to the embedding vector generator server.
 * @param text The text to convert.
 * @returns Embedding vector.
 */
export async function generateEmbeddingVector(text: string) {
    try {
        const res = await embeddingApi.post("/embedding", { text })
        return res.data.embedding
    }
    catch (err) {
        throw new Error(`Failed to generate embedding vector. Error: "${err instanceof Error ? err.message : err}"`)
    }
}