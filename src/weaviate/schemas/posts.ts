import { CollectionConfigCreate, configure, dataType, vectorIndex, vectorizer } from 'weaviate-client';

export const postVectorSchema: CollectionConfigCreate = {
    name: 'Post',
    properties: [
        {
            name: 'text',
            dataType: dataType.TEXT,
            description: 'Text for hybrid search',
        },
        {
            name: "createdAt",
            dataType: dataType.DATE,
            description: "Creation date of the post",
            indexFilterable:true
        },
        {
            name:"userId",
            dataType:dataType.TEXT,
            description:"The publisher of the post"
        },
    ],
    vectorizers: [
        vectorizer.none({
            name: "embedding",
            vectorIndexConfig: configure.vectorIndex.hnsw({ 
                distanceMetric: "cosine",
                quantizer:vectorIndex.quantizer.sq()
             })
        })
    ],
}