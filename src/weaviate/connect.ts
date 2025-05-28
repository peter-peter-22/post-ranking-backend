import weaviate from 'weaviate-client';
import { initWeaviateSchemas } from './schema';
import { env } from '../zod/env';

export const weaviateClient = await weaviate.connectToLocal(
 {
    host: env.WEAVIATE_HOST,   // URL only, no http prefix
    port: env.WEAVIATE_PORT,
    grpcPort: env.WEAVIATE_GRPC_PORT,     // Default is 50051, WCD uses 443
 })
 
await weaviateClient.isReady()

await initWeaviateSchemas(weaviateClient)