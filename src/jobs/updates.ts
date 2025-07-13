import { Job, Queue, Worker } from 'bullmq';
import { updateLikeCount } from '../db/controllers/posts/engagement/like/count';
import { ConnectionOptions } from "bullmq";
import { env } from 'process';

/** Redis client config for job queue. */
const redisJobs: ConnectionOptions = {
    url: env.REDIS_URL,
    db: 1
}

type UpdateJobCategory = "likeCount" | "followerCount" | "followingCount"

type UpdateJob = string

/** Job queue shared by updates those require a single id. */
export const updateQueue = new Queue<UpdateJob>('updateQueue', {
    connection: redisJobs,
});

export const updateWorker = new Worker<UpdateJob>(
    'updateQueue',
    processUpdateJob,
    {
        connection: redisJobs,
        concurrency: 10
    }
);

updateWorker.on('active', job => {
  console.log(`Job ${job.id} started`);
});

updateWorker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

updateWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

updateWorker.on('error', err => {
  console.error('Worker error:', err);
});

async function processUpdateJob(job: Job<UpdateJob>): Promise<void> {
    console.log(`Processing update job. Type: ${job.name} Data: ${job.data} Id: ${job.id}`)
    switch (job.name) {
        case "likeCount":
            await updateLikeCount(job.data)
            break;
        default:
            throw new Error(`Invalid update job type ${job.name}`)
    }
}

export async function addUpdateJob(category: UpdateJobCategory, data: UpdateJob, delay:number=60_000) {
    return await updateQueue.add(
        category,
        data,
        {
            jobId: `${category}/${data}`,
            delay,
            removeOnComplete: true,
            removeOnFail: true
        }
    );
}

console.log("The worker started")