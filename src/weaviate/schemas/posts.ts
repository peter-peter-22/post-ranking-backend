import { CollectionConfigCreate, configure, dataType, vectorizer } from 'weaviate-client';

export const postVectorSchema: CollectionConfigCreate = {
    name: 'Post',
    properties: [
        {
            name: 'text',
            dataType: dataType.TEXT,
            description: 'Text for hybrid search',
        }
    ],
    vectorizers:[
        vectorizer.none({
            name:"embedding",
            vectorIndexConfig:configure.vectorIndex.hnsw({distanceMetric:"cosine"})
        })
    ]
}

