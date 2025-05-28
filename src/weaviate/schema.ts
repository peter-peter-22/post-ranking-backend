import { CollectionConfigCreate, WeaviateClient } from "weaviate-client";
import { postVectorSchema } from "./schemas/posts";

export async function initWeaviateSchemas(weaviateClient:WeaviateClient) {
  // Get all schemas
  const schemas:CollectionConfigCreate[]=[
    postVectorSchema
  ]
  // Create the schemas those don't exist
  for(const schema of schemas){
    if(!schema.name)
      throw new Error(`Weaviate schema class is missing at: ${JSON.stringify(schema)}`)
    const exists = await weaviateClient.collections.exists(schema.name)
    if(exists)
      return console.log(`Weaviate schema ${schema.name} already exists.`)
    await weaviateClient.collections.create(schema)
    console.log(`Created Weaviate schema: ${schema.name}`)
  }
}