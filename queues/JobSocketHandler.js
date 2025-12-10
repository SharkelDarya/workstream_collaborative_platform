const JobManager = require('./JobManager');

function JobSocketHandler(io) {
    io.on('connection', socket => {

        socket.on('join workspace', data => {
            socket.join(`ws_${data.workspace_id}`);
        });

        socket.on('create job', async data => {
            const job = await JobManager.createJob(
                data.workspace_id,
                data.type,
                data.user_id,
                data.user_name
            );

            io.to(`ws_${data.workspace_id}`).emit('job created', job);
        });

        socket.on('assign job', async data => {
            const job = await JobManager.assignJob(
                data.job_id,
                data.workspace_id,
                data.user_id,
                data.user_name
            );

            io.to(`ws_${data.workspace_id}`).emit('job updated', job);
        });

        socket.on('update progress', async data => {
            const job = await JobManager.updateProgress(
                data.job_id,
                data.workspace_id,
                data.progress
            );

            io.to(`ws_${data.workspace_id}`).emit('job updated', job);
        });

        socket.on('delete job', async data => {
            await JobManager.deleteJob(data.job_id, data.workspace_id);
            io.to(`ws_${data.workspace_id}`).emit('job deleted', data.job_id);
        });

        socket.on('get jobs', async data => {
            const jobs = await JobManager.getWorkspaceJobs(data.workspace_id);
            socket.emit('all jobs', jobs);
        });
    });
}

module.exports = JobSocketHandler;
