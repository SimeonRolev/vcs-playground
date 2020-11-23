import ReactDOM from 'react-dom';

import CopyJob, {JobState} from './CopyJob'
import { waitForNode } from './mocks/util';

const ko = {
    observable: (val) => () => val,
    pureComputed: (callback) => callback
}

class CopyJobProgress {
    static create (data) {
        const job = new CopyJobProgress(data);
        return job;
    }

    static nodeId (id) {
        return 'copy-job-progress__' + id;
    }

    constructor (data) {
        this.type = 'job.copy'; // Required in the dialog-progress template
        this.id = data.job.uuid; // Required by ProgressTracker
        this.name = 'Copy shared items to my cloud'; // Sorting columns in the dialog need NAME
        this.nodeId = CopyJobProgress.nodeId(this.id);

        this.percentComplete = ko.observable(data.job.progress); // Global progress widget requires it
        this.status = ko.observable(JobState[data.job.state]); // Global progress widget requires it (status().name === 'failed')
        this.isCompleted = ko.pureComputed(() => this.status().completed);
    }

    update (percentComplete, state) {
        this.percentComplete(percentComplete);
        this.status(state);
    }

    renderReact (initialMessage) {
        waitForNode(
            () => document.getElementById(this.nodeId),
            node => {
                ReactDOM.render(
                    <CopyJob
                        progressTrackerJob={this}
                        initialMessage={initialMessage}
                    />,
                    node
                );
            }
        );
    }
}

export default CopyJobProgress
