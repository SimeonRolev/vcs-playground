import { act, fireEvent, render, screen, getQueriesForElement, waitFor } from '@testing-library/react';
import CopyJob, {JobState, CopyJobProcess} from './CopyJob';

import pushNotifier from './__mocks__/push-notifier';
import progressTracker from './__mocks__/progress-tracker';

afterEach(() => {
    pushNotifier.subscribers = []
    progressTracker.items = []
})

function addProgressTrackerJob (id='uuid') {
    const progressTrackerJob = {
        id,
        update: jest.fn((isCompleted, percentComplete, status) => {})
    }
    
    progressTracker.add(progressTrackerJob)
    return progressTrackerJob;
}

function createMessage (overrides = {}) {
    return {
        "job": {
            'uuid': 'uuid',
            'state': 'INIT',
            'size': '',
            'progress': 0,
            ...overrides
        }
    }
}

function postMessage (overrides = {} ) {
    act(() => {
        pushNotifier.post({
            event: null,
            message: createMessage(overrides)
        })
    })
}

function renderCopyJob () {
    const job = addProgressTrackerJob()

    render(
        <CopyJob
            progressTrackerJob={job}
            initialMessage={createMessage()}
        />)
}

test("Renders initial data properly", async () => {
    renderCopyJob()

    // TODO: Test "Percent" shouldnt always appear
    // TODO: Test icon rendered properly
    // TODO: Test JobState icon loaded properly / if icon: false -> no icon in the state column

    expect(await screen.findByTitle('name')).toHaveTextContent('Copy to my cloud')
    expect(await screen.findByTitle('size')).toHaveTextContent('')
    expect(await screen.findByTitle('status')).toHaveTextContent('Initializing')
});

test("Updates data from pushNotifications", async () => {
    renderCopyJob()

    postMessage({
        state: 'PREPARE',
        size: '250kb',
    })

    expect(await screen.findByTitle('name')).toHaveTextContent('Copy to my cloud')
    expect(await screen.findByTitle('size')).toHaveTextContent('250kb')
    expect(await screen.findByTitle('status')).toHaveTextContent('Preparing')

    postMessage({
        state: 'PROGRESS',
        size: '250kb',
        progress: 50
    })

    expect(await screen.findByTitle('name')).toHaveTextContent('Copy to my cloud')
    expect(await screen.findByTitle('size')).toHaveTextContent('250kb')
    expect(await screen.findByTitle('status')).toHaveTextContent('50% Downloading ...')

    postMessage({
        state: 'DONE',
        size: '250kb',
        progress: 100
    })

    expect(await screen.findByTitle('name')).toHaveTextContent('Copy to my cloud')
    expect(await screen.findByTitle('size')).toHaveTextContent('250kb')
    expect(await screen.findByTitle('status')).toHaveTextContent('Done')
})

test('Messages with different ID dont get handled', async () => {
    renderCopyJob()

    // This message should be ignored since it's ID is not the proper one
    postMessage({
        uuid: 'uuid-another',
        state: 'DONE',
        size: '250kb',
        progress: 100
    })

    expect(await screen.findByTitle('size')).toHaveTextContent('')
    expect(await screen.findByTitle('status')).toHaveTextContent(JobState.INIT.text)

    postMessage({
        uuid: 'uuid',
        state: 'DONE',
        size: '250kb',
        progress: 100
    })

    expect(await screen.findByTitle('size')).toHaveTextContent('250kb')
    expect(await screen.findByTitle('status')).toHaveTextContent(JobState.DONE.text)
})

test('Updates the knockout job', () => {
    renderCopyJob()

    postMessage({
        state: 'DONE',
        size: '250kb',
        progress: 50
    })

    expect(progressTracker.get('uuid').update).toBeCalledTimes(1)
    expect(progressTracker.get('uuid').update).toBeCalledWith(
        50,
        JobState.DONE    
    )
})

test('Invalid messages dont break component', () => {
    const invalidState = createMessage({state: "BANG"})
    const invalidProgress = createMessage({state: "BANG"}) // 0 - 100
    throw new Error("Not implemented")
})

test('Error type of message creates information collapsible toggle', () => {
    throw new Error("Not implemented")
})
