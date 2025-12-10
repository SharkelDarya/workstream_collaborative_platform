const { Queue, Worker, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis();

const jobQueue = new Queue('workspace_jobs', { connection });
const jobEvents = new QueueEvents('workspace_jobs', { connection });

module.exports = { jobQueue, jobEvents, Worker };