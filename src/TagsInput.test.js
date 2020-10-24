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
    test('categorizes initial tags', () => {
        const WARNING_IGNORE_CASE_TEXT = 'First'
        const NORMAL_TEXT = 'normal'
        setupTags([
            WARNING_IGNORE_CASE_TEXT, 
            NORMAL_TEXT
        ], {
            categories: [
                {
                    name: 'TOO_LONG',
                    predicate: str => str.length > 20,
                    cssStyle: 'taginput__tag--error',
                    message: 'This string is too long.',
                },
                {
                    name: 'IGNORE_CASE',
                    predicate: str => str.toLowerCase() !== str,
                    cssStyle: 'taginput__tag--warning',
                    message: 'Warning: case is ignored',
                }
            ]
        })

        const TOO_LONG_TEXT = 'toolongofastringisnotallowed'
        const input = getInput();
        userEvent.type(input, `${TOO_LONG_TEXT}{enter}`)

        const warningTag = getTagByText(WARNING_IGNORE_CASE_TEXT)
        warningTag.classList.contains('taginput__tag')
        warningTag.classList.contains('taginput__tag--warning')

        const errorTag = getTagByText(TOO_LONG_TEXT)
        errorTag.classList.contains('taginput__tag--error')
        errorTag.classList.contains('taginput__tag')

        const normalTag = getTagByText(NORMAL_TEXT)
        normalTag.classList.contains('taginput__tag')
    })
})

// test('calls onChange on add/delete tag', () => {throw Error('not implemented');});
