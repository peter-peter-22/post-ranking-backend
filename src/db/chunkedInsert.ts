export async function chunkedInsert(data: Array<any>, callback: (rows: Array<any>) => Promise<void>) {
    const max = 32000
    const chunkCount = Math.ceil(data.length / max)
    await Promise.all(
        Array.from({ length: chunkCount }).map((_, i) => {
            const chunk = data.slice(i * max, (i + 1) * max - 1)
            return callback(chunk)
        })
    )
}