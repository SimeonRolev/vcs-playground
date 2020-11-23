import { act, within } from '@testing-library/react';

import pushNotifier from '../mocks/push-notifier';
import progressTracker from '../mocks/progress-tracker';

function addProgressTrackerJob (id='uuid') {
    const progressTrackerJob = {
        id,
        update: jest.fn((percentComplete, status) => {})
    }
    
    progressTracker.add(progressTrackerJob)
    return progressTrackerJob;
}

function createMessageData (overrides = {}) {
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
    const message = createMessageData(overrides);
    act(() => {
        pushNotifier.post({
            event: null,
            message
        })
    })
    return message;
}

function createHTMLNode (id) {
    let el = document.getElementById(id)
    if (!el) {
        el = document.createElement('div')
        el.setAttribute('id', id)
        el.setAttribute('data-testid', id)
        document.body.appendChild(el)
    }
    return el;
}

async function assetReactJobContents (elem, sizeText, statusText) {
    expect(await within(elem).findByTitle('name')).toHaveTextContent('Copy to my cloud')
    expect(await within(elem).findByTitle('size')).toHaveTextContent(sizeText)
    expect(await within(elem).findByTitle('status')).toHaveTextContent(statusText)
}

export {
    addProgressTrackerJob,
    createMessageData,
    postMessage,
    createHTMLNode,
    assetReactJobContents
}
