import progressTracker from './mocks/progress-tracker'
import pushNotifier from './mocks/push-notifier'
import CopyJobProgress from './CopyJobProgress';

function trackCopyFiles () {
    pushNotifier.listen('job.copy', 'v2').subscribe( ({ event, message }) => {
        const jobId = message.job.uuid;
        const job = progressTracker.get(jobId);
        if (!job) {
            const progressJob = CopyJobProgress.create(message)
            progressTracker.add(progressJob);
            progressJob.renderReact(message)
        }
    });
}

export { trackCopyFiles };
