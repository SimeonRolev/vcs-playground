import { render, screen } from '@testing-library/react';
import CopyJob, {JobState} from '../CopyJob';

import pushNotifier from '../mocks/push-notifier';
import progressTracker from '../mocks/progress-tracker';
import userEvent from '@testing-library/user-event';

import {
    addProgressTrackerJob,
    createMessageData,
    postMessage
} from './util'

afterEach(() => {
    pushNotifier.subscribers = []
    progressTracker.items = []
})

function renderCopyJob () {
    const job = addProgressTrackerJob()

    render(
        <CopyJob
            progressTrackerJob={job}
            initialMessage={createMessageData()}
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
    expect(progressTracker.get('uuid').update).toBeCalledWith(50, JobState.DONE)
})

test('Invalid messages dont break component', () => {
    const invalidState = createMessageData({state: "BANG"})
    const invalidProgress = createMessageData({state: "BANG"}) // 0 - 100
    throw new Error("Not implemented")
})

test('Finished job error type of message creates information collapsible toggle', async () => {
    renderCopyJob()

    expect(screen.queryByRole('button', {name: 'copy-job__errors_toggler'})).not.toBeInTheDocument()

    postMessage({
        state: 'DONE',
        errors: [
            'error/file.jpg',
            'error/two/file.jpg'
        ]
    })

    expect(await screen.findByText('error/file.jpg')).toBeInTheDocument()
    expect(await screen.findByText('error/two/file.jpg')).toBeInTheDocument()

    // Expect collapsible closed
    const infoButton = await screen.findByRole('button', { name: /expand errors/i })
    const exapandable = await screen.findByRole('alert', { name: /errors info/i })

    function assertCollapsed() {
        expect(infoButton).toHaveAttribute('aria-expanded', "false")
        expect(infoButton).toHaveAttribute('aria-pressed', "false")
        expect(exapandable).not.toHaveClass('expanded')
    }

    function assertExpanded() {
        expect(infoButton).toHaveAttribute('aria-expanded', 'true')
        expect(infoButton).toHaveAttribute('aria-pressed', 'true')
        expect(exapandable).toHaveClass('expanded')    
    }

    assertCollapsed()

    userEvent.click(infoButton);
    assertExpanded()

    userEvent.click(infoButton);
    assertCollapsed()
})

test('Integration test with the knockout copmonent', () => {
    /*
        Mock the .create method to create new element in the document

        ReactDOM.render(<CopyJob />, node)
        postMessage({state: JobState.DONE})
        postMessage({state: JobState.FAILED})

        progressTracker.clearFinished()

        expect progressTrackerJob to not contain the job anymore.

        Rely on knockout that the <copy-job> component will delete the div
        and so will the React copmonent disappear - this will not be tested here
    */
})
