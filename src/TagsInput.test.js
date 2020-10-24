import { fireEvent, render, screen, getQueriesForElement } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagsInput from './TagsInput';

function getTagByText (tagText) {
    return screen.getByRole('listitem', { name: tagText });
}

function verifyTagDeleted (tagText) {
    const tag = screen.queryByRole('listitem', { name: tagText })
    expect(tag).toBeNull();
}

function getInput () {
    return screen.getByRole('textbox', { name: /insert tag/i});
}

function queryCloseButtonForTag (tagText) {
    const tag = getTagByText(tagText)
    const tagQueries = getQueriesForElement(tag)
    return tagQueries.getByRole('button', { name: 'Remove' } );
}

const onChangeDefault = jest.fn(items => {})

function setupTags(initialTags=[], overrideProps={}) {
    const props = Object.assign({
        onChange: onChangeDefault,
        initialTags
    }, overrideProps)
    return render(<TagsInput {...props} />)
}

describe('Add tag', () => {

    test('adds tag on enter key', () => {
        setupTags()
        const input = getInput();
        userEvent.type(input, 'example{enter}');
        getTagByText('example');
    });
        
    test('adds tag on custom separator', () => {
        setupTags([], { separators: ['Z', '|'] })
        const input = getInput();
        userEvent.type(input, 'firstZ');
        getTagByText('first');
        userEvent.type(input, 'second|');
        getTagByText('second');
    });
    
    test('add tag on blur (remove focus from input field)', () => {
        setupTags()
        const input = getInput();
        userEvent.type(input, 'example');
        fireEvent.blur(input);
        
        getTagByText('example')
    });

    test('loads inital tags', () => {
        setupTags(['first', 'second'])

        getTagByText('first')
        getTagByText('second')
    });

    test('clears input on add', () => {
        setupTags()
        const input = getInput();
        userEvent.type(input, 'example{enter}');
        expect(input.value).toBe('');
    })
    
    test('cannot add empty tag', () => {
        setupTags()
        const input = getInput();
        userEvent.type(input, '{enter}');
        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
        
        userEvent.type(input, 'aa{backspace}{backspace}{enter}');
        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });

    test('cannot add duplicate tag', () => {
        setupTags(['first'])
        const input = getInput();
        userEvent.type(input, 'first{enter}');
        expect(screen.queryAllByRole('listitem')).toHaveLength(1);
        getTagByText('first');
    })
})

describe('Remove tag', () => {
    test('on clicking x', () => {
        setupTags(['first', 'second'])
        const secondTagCloseButton = queryCloseButtonForTag('second')
        userEvent.click(secondTagCloseButton)

        getTagByText('first');
        verifyTagDeleted('second');
    })

    test('on pressing Backspace', () => {
        setupTags(['first', 'second'])
        const input = getInput();
        userEvent.type(input, '{backspace}');

        getTagByText('first');
        verifyTagDeleted('second');

        userEvent.type(input, '{backspace}');
        verifyTagDeleted('first');
    })

    test('backspace on no tags doesnt throw', () => {
        setupTags();
        const input = getInput();
        userEvent.type(input, '{backspace}');
    })
})

// Focusing
test('focus input on click', () => {
    setupTags()
    
    userEvent.click(screen.getByRole('list'));
    const input = getInput();
    expect(input).toHaveFocus();
});

describe('Categorizing tags', () => {
    
})

// test('calls onChange on add/delete tag', () => {throw Error('not implemented');});
// test('categorizing', () => {throw Error('not implemented');});
