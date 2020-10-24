import { fireEvent, render, screen, getQueriesForElement, waitFor, wait, getAllByTitle } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagsInput from './TagsInput';

afterEach(() => {
    jest.clearAllMocks()
})

function getTagByText (tagText) {
    return screen.getByRole('listitem', { name: tagText });
}

function queryTagByText (tagText) {
    return screen.queryByRole('listitem', { name: tagText });
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
        expect(queryTagByText('example')).toBeInTheDocument()
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

describe('Callbacks', () => {
    test('on add', async () => {

        setupTags(['first'], {
            categories: [
                {
                    name: "FIRST_CATEGORY",
                    predicate: str => str === 'first'
                }
            ]
        })

        await waitFor(() => expect(queryTagByText('first')).toBeInTheDocument())
        
        expect(onChangeDefault).lastCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    text: 'first'
                })
            ])
        )
    
        const input = getInput();
        userEvent.type(input, 'second{enter}')

        await waitFor(() => expect(queryTagByText('second')).toBeInTheDocument())

        expect(onChangeDefault).lastCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    text: 'first',
                    category: expect.objectContaining({
                        name: "FIRST_CATEGORY"
                    })
                }),
                expect.objectContaining({
                    text: 'second',
                    category: undefined
                }),
            ])
        )

        expect(onChangeDefault).toBeCalledTimes(2);
    })

    test('on remove', async () => {
        setupTags(['first', 'second'], {
            categories: [
                {
                    name: "FIRST_CATEGORY",
                    predicate: str => str === 'first'
                }
            ]
        })

        await waitFor(() => expect(queryTagByText('first')).toBeInTheDocument())
        await waitFor(() => expect(queryTagByText('second')).toBeInTheDocument())

        expect(onChangeDefault).lastCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    text: 'first',
                    category: expect.objectContaining({
                        name: "FIRST_CATEGORY"
                    })
                }),
                expect.objectContaining({
                    text: 'second',
                    category: undefined
                }),
            ])
        )

        const input = getInput();
        userEvent.type(input, '{backspace}')

        await waitFor(() => expect(queryTagByText('second')).not.toBeInTheDocument())

        expect(onChangeDefault).lastCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    text: 'first',
                    category: expect.objectContaining({
                        name: "FIRST_CATEGORY"
                    })
                })
            ])
        )
        expect(onChangeDefault).not.lastCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    text: 'second'
                })
            ])
        )

        expect(onChangeDefault).toBeCalledTimes(2);
    })    
})

function assertTagsOrder(properOrder) {
    const allTags = screen.queryAllByRole('listitem');
    expect(allTags.length).toBe(properOrder.length)

    allTags.forEach((tag, index) => {
        const firstElem = getTagByText(properOrder[index]);
        expect(tag).toStrictEqual(firstElem);
    })
}

describe('Arrow navigation', () => {

    describe('Arrow left', () => {

        test('moves input one step at a time (to the left) if input is empty', () => {
            setupTags(['first', 'third']);

            const input = getInput();
            userEvent.type(input, 'fourth{enter}');
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            userEvent.type(input, 'second{enter}');
    
            const properOrder = ['first', 'second', 'third', 'fourth']
            assertTagsOrder(properOrder)
        })

        test('doesnt move input if input is not empty', () => {
            setupTags(['first']);

            const input = getInput();
            userEvent.type(input, 'second');
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            userEvent.type(input, '{enter}');
    
            const properOrder = ['first', 'second']
            assertTagsOrder(properOrder)
            
        })

        test('spamming the arrow doesnt break the input, adds to beginning', () => {
            setupTags(['first', 'second']);

            const input = getInput();
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            userEvent.type(input, 'zero{enter}');
    
            const properOrder = ['zero', 'first', 'second']
            assertTagsOrder(properOrder)
        })
    })

    describe('Arrow right', () => {

        test('moves input one step at a time (to the right) if input is empty', () => {
            setupTags(['first', 'third']);

            const input = getInput();
            // Move to beginning
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            fireEvent.keyDown(input, { key: 'ArrowRight' });
            userEvent.type(input, 'second{enter}');
            fireEvent.keyDown(input, { key: 'ArrowRight' });
            userEvent.type(input, 'fourth{enter}');
    
            const properOrder = ['first', 'second', 'third', 'fourth']
            assertTagsOrder(properOrder)
        })

        test('doesnt move input if input is not empty', () => {
            setupTags(['first']);

            const input = getInput();
            // Move to beginning
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            userEvent.type(input, 'second');
            fireEvent.keyDown(input, { key: 'ArrowRight' });
            fireEvent.keyDown(input, { key: 'ArrowRight' });
            userEvent.type(input, '{enter}');
    
            const properOrder = ['second', 'first']
            assertTagsOrder(properOrder)
            
        })

        test('spamming the arrow doesnt break the input, adds to end', () => {
            setupTags(['first', 'second']);

            const input = getInput();
            // Move to beginning
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            fireEvent.keyDown(input, { key: 'ArrowLeft' });
            fireEvent.keyDown(input, { key: 'ArrowRight' });
            fireEvent.keyDown(input, { key: 'ArrowRight' });
            fireEvent.keyDown(input, { key: 'ArrowRight' });
            fireEvent.keyDown(input, { key: 'ArrowRight' });
            fireEvent.keyDown(input, { key: 'ArrowRight' });
            userEvent.type(input, 'last{enter}');
    
            const properOrder = ['first', 'second', 'last']
            assertTagsOrder(properOrder)
        })
    })

    test('Backspace deletes the tag behind the input if input is empty', () => {
        setupTags(['first', 'del1', 'second', 'del2']);

        const input = getInput();
        fireEvent.keyDown(input, { key: 'ArrowLeft' });
        fireEvent.keyDown(input, { key: 'ArrowLeft' });
        fireEvent.keyDown(input, { key: 'Backspace' });
        assertTagsOrder(['first', 'second', 'del2'])

        fireEvent.keyDown(input, { key: 'ArrowRight' });
        fireEvent.keyDown(input, { key: 'ArrowRight' });
        fireEvent.keyDown(input, { key: 'Backspace' });
        assertTagsOrder(['first', 'second'])

        fireEvent.keyDown(input, { key: 'Backspace' });
        assertTagsOrder(['first'])

        // Move to beginning - Backspace should not work
        fireEvent.keyDown(input, { key: 'ArrowLeft' });
        fireEvent.keyDown(input, { key: 'Backspace' });
        assertTagsOrder(['first'])

        userEvent.type(input, 'zero{enter}');

        const properOrder = ['zero', 'first']
        assertTagsOrder(properOrder)
    })

    test('Backspace doesnt delete items if input is not empty', () => {
        setupTags(['first']);

        const input = getInput();
        userEvent.type(input, 'del{backspace}{backspace}{backspace}');
        assertTagsOrder(['first'])
        userEvent.type(input, '{backspace}');
        
        assertTagsOrder([])
    })
})
