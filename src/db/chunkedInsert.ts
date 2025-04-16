export async function chunkedInsert<T>(data: Array<T>, callback: (rows: Array<T>) => Promise<void>) {
    const max = 10000
    const chunkCount = Math.ceil(data.length / max)
    await Promise.all(
        Array.from({ length: chunkCount }).map((_, i) => {
            const chunk = data.slice(i * max, (i + 1) * max - 1)
            return callback(chunk)
        })
    )
}