class JobUIController {
  constructor() {
    this.socket = io();
    this.currentUser = null;
    this.workspaceId = null;
    this.init();
  }

  async init() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      this.currentUser = await res.json();
    }

    this.workspaceId = new URLSearchParams(window.location.search).get('workspace_id');
    
    if (this.workspaceId) {
      this.setupSocket();
      this.loadJobs();
    }
  }

  setupSocket() {
    this.socket.emit('join workspace', { workspace_id: this.workspaceId });

    this.socket.on('all jobs', (jobs) => this.showJobs(jobs));
    this.socket.on('job created', (job) => this.addJob(job));
    this.socket.on('job updated', (job) => this.updateJob(job));
    this.socket.on('job deleted', (jobId) => this.removeJob(jobId));
    this.socket.on('you assigned job', (job) => this.addSlider(job));
  }

  loadJobs() {
    this.socket.emit('get jobs', { workspace_id: this.workspaceId });
  }

  showJobs(jobs) {
    const container = document.getElementById('jobs');
    container.innerHTML = '';

    if (!jobs || jobs.length === 0) {
      container.innerHTML = '<p>No jobs yet</p>';
      return;
    }

    jobs.forEach(job => {
      container.appendChild(this.createJobElement(this.normalizeJob(job)));
    });
  }

  normalizeJob(job) {
    // Серверные поля: assigned_user / assigned_name; UI ожидает assignedTo / assignedUserName.
    // Также приводим id/progress к числам для корректных сравнений.
    const assignedRaw = job.assignedTo || job.assigned_user || job.assigned_user_id;
    return {
      ...job,
      id: job.id,
      assignedTo: assignedRaw !== undefined ? Number(assignedRaw) : undefined,
      assignedUserName: job.assignedUserName || job.assigned_name || job.assigned_user_name,
      progress: Number(job.progress ?? 0),
    };
  }

  createJobElement(rawJob) {
    const job = this.normalizeJob(rawJob);
    const div = document.createElement('div');
    div.className = 'job-item';
    div.id = `job-${job.id}`;
    
    const assignedText = job.assignedUserName ? 
      ` - Working: ${job.assignedUserName}` : '';

    div.innerHTML = `
      <div class="job-info">
        <strong>${job.type}</strong> 
        ${job.status} 
        [${job.progress}%]
        ${assignedText}
      </div>
      <div class="job-actions">
        ${this.getJobButtons(job)}
      </div>
      ${this.getProgressControl(job)}
    `;

    return div;
  }

  getJobButtons(job) {
    const isMyJob = job.assignedTo !== undefined && Number(job.assignedTo) === Number(this.currentUser?.id);
    const isAssigned = job.assignedTo && !isMyJob;

    if (isMyJob) {
      return `<button onclick="jobController.deleteJob('${job.id}')">Delete</button>`;
    } else if (!job.assignedTo) {
      return `
        <button onclick="jobController.assignJob('${job.id}')">Start Working</button>
        <button onclick="jobController.deleteJob('${job.id}')">Delete</button>
      `;
    } else {
      return `<button onclick="jobController.deleteJob('${job.id}')">Delete</button>`;
    }
  }

  getProgressControl(job) {
    const isMyJob = job.assignedTo !== undefined && Number(job.assignedTo) === Number(this.currentUser?.id);
    
    if (isMyJob) {
      return `
        <div class="progress-control">
          <input type="range" min="0" max="100" value="${job.progress}" 
                 oninput="jobController.updateProgress('${job.id}', this.value)">
          <span>${job.progress}%</span>
        </div>
      `;
    }
    return '';
  }

  addJob(job) {
    const container = document.getElementById('jobs');
    const noJobs = container.querySelector('p');
    
    if (noJobs) noJobs.remove();
    
    container.prepend(this.createJobElement(this.normalizeJob(job)));
  }

  updateJob(job) {
    const existingJob = document.getElementById(`job-${job.id}`);
    if (existingJob) {
      existingJob.replaceWith(this.createJobElement(this.normalizeJob(job)));
    }
  }

  removeJob(jobId) {
    const jobElement = document.getElementById(`job-${jobId}`);
    if (jobElement) {
      jobElement.remove();
    }
  }

  addSlider(job) {
    this.updateJob(job);
  }

  createJob(type) {
    this.socket.emit('create job', {
      workspace_id: this.workspaceId,
      type: type,
      user_id: this.currentUser.id,
      user_name: this.currentUser.name
    });
  }

  assignJob(jobId) {
    this.socket.emit('assign job', {
      job_id: jobId,
      workspace_id: this.workspaceId,
      user_id: this.currentUser.id,
      user_name: this.currentUser.name
    });
  }

  updateProgress(jobId, progress) {
    this.socket.emit('update progress', {
      job_id: jobId,
      workspace_id: this.workspaceId,
      progress: parseInt(progress)
    });
  }

  deleteJob(jobId) {
    if (confirm('Delete this job?')) {
      this.socket.emit('delete job', {
        job_id: jobId,
        workspace_id: this.workspaceId
      });
    }
  }
}