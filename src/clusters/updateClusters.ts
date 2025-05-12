import axios from "axios";
import { env } from "../zod/env";

export async function updateUserClusters()
{
    console.log("Updating user clusters.")
    await axios.get(env.CLUSTERING_API_URL+"/clustering")
    console.log("Updated user clusters.")
}