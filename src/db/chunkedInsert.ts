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