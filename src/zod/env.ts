import 'dotenv/config';
import z from "zod";

const envModel=z.object({
    DB_URL:z.string().url(),
    EMBEDDING_API_URL:z.string().url(),
    CLUSTERING_API_URL:z.string().url(),
    REDIS_HOST:z.string(),
    REDIS_PORT:z.coerce.number(),
})

export const env=envModel.parse(process.env)