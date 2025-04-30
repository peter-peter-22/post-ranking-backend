/** Execute database queries in batches to prevent errors.
 * @param data Array of rows to insert.
 * @param callback Callback to execute on each batch.
 * @param batchSize Number of rows per batch. Default is 10,000.
 * @param pararrel Whether to run the queries in parallel or not. Default is true.
*/
export async function chunkedInsert<T>(data: Array<T>, callback: (rows: Array<T>) => Promise<void>, batchSize = 10000, pararrel: boolean=true) {
    const chunkCount = Math.ceil(data.length / batchSize)
    const promises = Array.from({ length: chunkCount }).map((_, i) => {
        const chunk = data.slice(i * batchSize, (i + 1) * batchSize - 1)
        return callback(chunk)
    })
    if (pararrel)
        await Promise.all(promises)
    else
        for (const promise of promises)
            await promise
}