import axios from "axios";

export async function updateUserClusters()
{
    console.log("Updating user clusters.")
    await axios.get(process.env.EMBEDDING_VECTOR_API_URL+"/clustering")
    console.log("Updated user clusters.")
}