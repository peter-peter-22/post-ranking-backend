import { weaviateClient } from "../connect";
import { initWeaviateSchemas } from "../schema";

export async function resetWeaviateSchema(){
    console.log("Resetting vector db schema")
    await weaviateClient.collections.deleteAll()
    await initWeaviateSchemas(weaviateClient)
}