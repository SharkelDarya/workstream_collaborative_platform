const Redis = require("ioredis");
const { v4: uuidv4 } = require("uuid");

const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

class JobManager {
    static async createJob(workspace_id, type, user_id, user_name) {
        const id = uuidv4();
        const jobKey = `job:${id}`;
        const listKey = `workspace:${workspace_id}:jobs`;

        const job = {
            id,
            workspace_id,
            type,
            status: "pending",
            progress: 0,
            created_at: Date.now(),
            assigned_user: "",
            assigned_name: "",
            created_by: user_id,
            created_by_name: user_name
        };

        await redis.hmset(jobKey, job);
        await redis.lpush(listKey, id);

        return job;
    }

    static async takeJob(job_id, workspace_id, user_id, user_name) {
    const jobKey = `job:${job_id}`;
    const exists = await redis.exists(jobKey);

    if (!exists) return null;

    await redis.hmset(jobKey, {
        assigned_user: user_id,
        assigned_name: user_name,
        status: "taken"
    });

    return await redis.hgetall(jobKey);
}

    // Backward compatibility alias used by socket handler
    static async assignJob(job_id, workspace_id, user_id, user_name) {
        return this.takeJob(job_id, workspace_id, user_id, user_name);
    }

    static async updateProgress(job_id, workspace_id, progress) {
        const jobKey = `job:${job_id}`;
        const exists = await redis.exists(jobKey);

        if (!exists) return null;

        await redis.hset(jobKey, "progress", progress);

        if (progress >= 100) {
            await redis.hset(jobKey, "status", "done");
        }

        return await redis.hgetall(jobKey);
    }

    static async deleteJob(job_id, workspace_id) {
        const jobKey = `job:${job_id}`;
        const listKey = `workspace:${workspace_id}:jobs`;

        await redis.del(jobKey);
        await redis.lrem(listKey, 0, job_id);
    }

    static async getWorkspaceJobs(workspace_id) {
        const listKey = `workspace:${workspace_id}:jobs`;
        const ids = await redis.lrange(listKey, 0, -1);

        const jobs = [];
        for (const id of ids) {
            const job = await redis.hgetall(`job:${id}`);
            if (job && job.id) jobs.push(job);
        }
        return jobs;
    }
}

module.exports = JobManager;
