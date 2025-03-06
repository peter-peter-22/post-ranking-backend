//** Remove the duplicates from an array of primitives. */
export function removeDuplicates(arr:any[]) {
    // Use Set to remove duplicates and convert it back to an array
    return [...new Set(arr)];
}