import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagsInput from './TagsInput';

test('adds tag on enter key', () => {
    render(<TagsInput onChange={() => {}}/>);
    const input = screen.getByRole('textbox');
    userEvent.type(input, 'example{enter}');

    expect(input.value).toBe('');
    expect(screen.getByText('example')).toBeTruthy()
});

test('adds tag on custom separator', () => {
    render(<TagsInput onChange={() => {}} separators={['Z']} />);
    const input = screen.getByRole('textbox');
    userEvent.type(input, 'exampleZ');

    expect(input.value).toBe('');
    expect(screen.getByText('example')).toBeTruthy()
})

test('removes tag on clicking x', () => {throw Error('not implemented')})
test('loads category styles properly', () => {throw Error('not implemented')})
test('calls onChange on add/delete tag', () => {throw Error('not implemented')})
test('loads inital tags', () => {throw Error('not implemented')})
test('focus input on click', () => {throw Error('not implemented')})
test('add tag on blur (remove focus from input field)', () => {throw Error('not implemented')})
test('backspace deletes prev item if input is empty', () => {throw Error('not implemented')})
