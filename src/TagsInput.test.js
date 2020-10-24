import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagsInput from './TagsInput';

test('adds tag on enter key', () => {
    render(<TagsInput onChange={() => {}}/>);
    const input = screen.getByRole('textbox');
    userEvent.type(input, 'example{enter}');

    expect(input.value).toBe('');
    expect(screen.getByText('example')).toBeTruthy();
});

test('cannot add empty tag', () => {
    render(<TagsInput onChange={() => {}}/>);
    const input = screen.getByRole('textbox');
    userEvent.type(input, '{enter}');
    expect(screen.queryByText('x')).not.toBeInTheDocument();

    userEvent.type(input, 'aa{backspace}{backspace}{enter}');
    expect(screen.queryByText('x')).not.toBeInTheDocument();
});

test('adds tag on custom separator', () => {
    render(<TagsInput onChange={() => {}} separators={['Z']} />);
    const input = screen.getByRole('textbox');
    userEvent.type(input, 'exampleZ');

    expect(input.value).toBe('');
    expect(screen.getByText('example')).toBeTruthy();
});

// Focusing
test('focus input on click', () => {
    render(<TagsInput onChange={() => {}}/>);
    
    userEvent.click(screen.getByTestId('tagsinput__wrapper'));
    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
});

test('add tag on blur (remove focus from input field)', () => {
    render(<TagsInput onChange={() => {}}/>);
    const input = screen.getByRole('textbox');
    userEvent.type(input, 'example');
    fireEvent.blur(input);
    
    expect(screen.getByText('example')).toBeTruthy();
});

test('loads inital tags', () => {
    render(<TagsInput
        initialTags={['first', 'second']}
        onChange={() => {}}
    />);

    expect(screen.getByText('first')).toBeTruthy();
    expect(screen.getByText('second')).toBeTruthy();

});


// test('removes tag on clicking x', () => {throw Error('not implemented');});
// test('loads category styles properly', () => {throw Error('not implemented');});
// test('calls onChange on add/delete tag', () => {throw Error('not implemented');});
// test('backspace deletes prev item if input is empty', () => {throw Error('not implemented');});
// test('categorizing', () => {throw Error('not implemented');});

