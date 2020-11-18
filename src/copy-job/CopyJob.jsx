import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

// import { Dialog } from '../base/dialog';
// import {waitForNode} from '../lib/utils';

// import pushNotifier from '../base/push-notifier';
// import { progressTracker } from '../progress/progress';
import pushNotifier from './__mocks__/push-notifier';
import progressTracker from './__mocks__/progress-tracker';

const gettext = (val) => val;

const JobState = {
    'INIT': {
        completed: false,
        name: 'init',
        text: gettext('Initializing'),
        icon: 'icon icon-status-pending'
    },
    'PREPARE': {
        completed: false,
        name: 'prepare',
        text: gettext('Preparing'),
        icon: 'icon icon-status-pending'
    },
    'PROGRESS': {
        completed: false,
        name: 'progress',
        text: gettext('Downloading ...'),
        icon: false
    },
    'DONE': {
        completed: true,
        name: 'complete',
        text: gettext('Done'),
        icon: 'icon icon-status-ok'
    },
    'FAILED': {
        completed: true,
        name: 'failed',
        text: gettext('Failed'),
        icon: 'icon icon-status-warning'
    }
};

const CopyJobMessage = {
    fromData: data => ({
        size: data.job.size,
        progress: data.job.progress,
        state: JobState[data.job.state]
    })
}

function CopyJob ({ progressTrackerJob, initialMessage }) {
    const [message, setMessage] = useState(CopyJobMessage.fromData(initialMessage));

    useEffect(() => {
        let mounted = true;
        pushNotifier.listen('job.copy', 'v2').subscribe(({ event, message }) => {
            const jobId = message.job.uuid;
            const messageJob = progressTracker.get(jobId);

            if (jobId === progressTrackerJob.id) {
                if (mounted) {
                    handleMessage(message)
                }
            }
        });
        return () => {
            mounted = false;
            // pushNotifier.unsubscribe ?;
        };
    }, [progressTrackerJob.id]);

    const firstMessageCall = useRef(true)
    useEffect(() => {
        if (firstMessageCall.current === true) {
            firstMessageCall.current = false;
            return
        }

        progressTrackerJob.update(message.progress, message.state)
    }, [message, progressTrackerJob])

    const handleMessage = (message) => {
        const msg = CopyJobMessage.fromData(message) 
        setMessage(msg);
    }


    return (
        <div className='progress-ls-item progress-ls-file'>
            <span className='icon icon-duplicate' />

            <div className='name' title={'name'}>
                <span className='duo-attr name-text'>
                    <span> {gettext('Copy to my cloud') }</span>
                </span>
            </div>

            <div className='attr attr-primary size' title={'size'}>{message.size}</div>
            <div className='attr attr-primary status' title={ 'status' }>
                <span className='percent'>{ message.progress + '% ' }</span>
                {message.state.icon ? <span className={message.state.icon} /> : null }
                <span className='status-text'>{message.state.text}</span>
            </div>
            <div className='attr attr-primary icon-column'>
                <span className='icons-wrap'>
                    {/* Icon view */}
                    <span className='icon icon-status-additional-info' />
                </span>
            </div>

            {/* <progress-bar params="value: item.percentComplete()"></progress-bar> */}
        </div>
    );
};

CopyJob.propTypes = {
    progressTrackerJob: PropTypes.shape({
        'id': PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]).isRequired,
        'update': PropTypes.func.isRequired,
    }),
    initialMessage: PropTypes.shape({
        'job': PropTypes.shape({
            'uuid': PropTypes.string.isRequired,
            'state': PropTypes.string.isRequired,
            'size': PropTypes.string,
            'progress': PropTypes.number,
        })
    })
};


function trackCopyFiles () {
    pushNotifier.listen('job.copy', 'v2').subscribe(({ event, data }) => {
        const jobId = data.job.uuid;
        const job = progressTracker.get(jobId);
        console.log(data);
        if (!job) {
            progressTracker.add(CopyJobProcess.create(data));
        }
    });
}

const ko = {
    observable: (val) => () => val,
    pureComputed: (callback) => callback()
}

const waitForNode = () => {}

class CopyJobProcess {
    static create (data) {
        const job = new CopyJobProcess(data);

        // waitForNode(
        //     () => document.getElementById(job.nodeId),
        //     node => {
        //         ReactDOM.render(
        //             <CopyJob
        //                 progressTrackerJob={job}
        //                 initialMessage={data}
        //             />,
        //             node
        //         );
        //     }
        // );

        return job;
    }

    constructor (data) {
        this.type = 'job.copy'; // Required in the dialog-progress template
        this.id = data.job.uuid; // Required by ProgressTracker
        this.name = 'Copy shared items to my cloud'; // Sorting columns in the dialog need NAME
        this.nodeId = 'copy-job-progress__' + this.id;

        this.percentComplete = ko.observable(data.job.progress); // Global progress widget requires it
        this.status = ko.observable(JobState[data.job.state]); // Global progress widget requires it (status().name === 'failed')
        this.isCompleted = ko.pureComputed(() => this.status().completed);
    }

    update (percentComplete, state) {
        this.percentComplete(percentComplete);
        this.status(state);
    }
}

export default CopyJob;
export {
    CopyJobProcess,
    JobState,
    trackCopyFiles,
};
