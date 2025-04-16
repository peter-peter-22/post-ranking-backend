import { db } from "../..";
import { EngagementHistory, engagementHistory } from "../../schema/engagementHistory";

/** Get a nested map of engagement relationships. */
async function getEngagementHistoryMap() {
    // Get the engagement hisories from the db
    const historyList = await db.select().from(engagementHistory);
    
    // Build the nested map
    const historyMap = new Map<string, Map<string, EngagementHistory>>();
    historyList.forEach(history => {
        if (!historyMap.has(history.viewerId)) {
            historyMap.set(history.viewerId, new Map<string, EngagementHistory>());
        }
        historyMap.get(history.viewerId)?.set(history.publisherId, history);
    });

    return historyMap
}

/**
 * Fetch the engagement history between all users and create a function that return the engagement history between two users.
 * @returns A function that return the engagement history between two users.
 */
export async function getEngagementHistoryReader() {
    const historyMap = await getEngagementHistoryMap()
    return (viewerId: string, publisherId: string):EngagementHistory|undefined => {
        // Check if the viewerId exists in the map
        const historiesOfViewer = historyMap.get(viewerId);
        if (historiesOfViewer) {
            // Check if the publisherId exists in the nested map
            return historiesOfViewer.get(publisherId);
        }
    }
}