/*
 Track job receives messages
 Creates job with the received message (not just INIT)
 Creates a dom node with the proper id
 The React component is rendered in that ID
 mock ProgressTracker clear finished  - removed from items. (Check if react component is rendered withing the DOM elem)
*/

import { screen } from '@testing-library/react';

import pushNotifier from '../mocks/push-notifier';
import progressTracker from '../mocks/progress-tracker';

import CopyJobProgress from '../CopyJobProgress';
import { trackCopyFiles } from '../listener';
import { JobState } from '../CopyJob';
import {
    createHTMLNode,
    postMessage,
    assetReactJobContents
} from './util';

jest.mock('../mocks/util')

afterEach(() => {
    jest.resetAllMocks()
})

afterEach(() => {
    pushNotifier.subscribers = []
    progressTracker.items = []
})

function assertProgressTrackerItem (id, state) {
    expect(progressTracker.items[0].id).toBe(id)
    expect(progressTracker.items[0].status()).toBe(state)
}

/* Just to simulate the Knockout component creating a DOM node.
    Normally, the progres-dialog.html will handle that
    if CopyJobProgress is registered as a knockout component. */
function mockProgressTrackerAdd () {
    jest.spyOn(progressTracker, 'add').mockImplementation((item) => {
        if (item.type === 'job.copy') {
            progressTracker.items.push(item)
            createHTMLNode(CopyJobProgress.nodeId(item.id))
        }
    })
}

function setup () {
    mockProgressTrackerAdd()
    trackCopyFiles()
}

test('trackCopyFiles catches messages and creates process tracker items', async () => {
    setup()
    postMessage({ state: 'PROGRESS', size: '250kb' })
    expect(progressTracker.items.length).toBe(1)
    assertProgressTrackerItem('uuid', JobState.PROGRESS)
})

test('trackCopyFiles adds to progressTracer proper object structure', () => {
    /* progressTracker's items should have:
        id, status() and isCompleted()
    */

    setup()
    postMessage()

    const firstCallArg = progressTracker.add.mock.calls[0][0]
    expect(progressTracker.add).toBeCalledTimes(1)
    expect(firstCallArg.id).toBe('uuid')
    expect(firstCallArg.status()).toBe(JobState.INIT)
    expect(firstCallArg.isCompleted()).toBe(false)
})

test('New jobs render the React item with proper data', async () => {
    setup()

    postMessage({uuid: 'first'})

    const first = await screen.findByTestId(CopyJobProgress.nodeId('first'))
    await assetReactJobContents(first, '', 'Initializing')
    
    postMessage({
        uuid: 'second',
        state: 'PROGRESS',
        progress: 50,
        size: '250kb'
    })

    const second = await screen.findByTestId(CopyJobProgress.nodeId('second'))
    await assetReactJobContents(second, '250kb', '50% Downloading ...')
})

test('trackCopyFiles doesnt create if item exists', async () => {
    setup()
    postMessage({ uuid: 'copy-job__one' })

    expect(progressTracker.add).toBeCalledTimes(1)
    expect(progressTracker.add).toBeCalledWith(
        expect.objectContaining({ id: 'copy-job__one' }))

    await screen.findByTestId(
        CopyJobProgress.nodeId('copy-job__one'))

    postMessage({uuid: 'copy-job__one'})
    expect(progressTracker.add).toBeCalledTimes(1)

    postMessage({uuid: 'copy-job__two'})
    expect(progressTracker.add).toBeCalledTimes(2)
    expect(progressTracker.add).toBeCalledWith(
        expect.objectContaining({ id: 'copy-job__two' }))

    await screen.findByTestId(CopyJobProgress.nodeId('copy-job__one'))
    await screen.findByTestId(CopyJobProgress.nodeId('copy-job__two'))
})
