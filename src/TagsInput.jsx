import React, {useState, useEffect, useReducer, useRef} from 'react'
import PropTypes from 'prop-types'
import { useFocus } from './hooks';

export default TagsInput;

function DefaultTag ({ tag, onRemove }) {

    const cssStyle = tag.category && tag.category.cssStyle;

    return (
        <div
            className={['tagsinput__tag', cssStyle].join(' ')}
            role='listitem'
            aria-label={tag.text}
        >
            <span>{tag.text}</span>
            <span
                role='button'
                aria-label='Remove'
                onClick={onRemove}
            >x</span>
        </div>
    )
}

DefaultTag.propTypes = {
    tag: PropTypes.instanceOf(CategorizedTag).isRequired,
    onRemove: PropTypes.func.isRequired
}

function CategorizedTag (text, category) {
    this.text = text;
    this.category = category;
}

function insertBeforeIndex(array, index, elem) {
    return [...array.slice(0, index), elem, ...array.slice(index)]
}

function removeBeforeIndex(array, index) {
    if (index < 1) {
        throw new Error('Tried to remove index lower than 0.')
    }
    return [...array.slice(0, index - 1), ...array.slice(index)]
}

function swapWithPreviousIndex(array, index) {
    [array[index - 1], array[index]] = [array[index], array[index - 1]]
    return array
}

const tagsReducer = function (state, action) {
    const inputIndex = state.indexOf('_INPUT')
    const stateCopy = [...state];

    if (new Set(state).size !== state.length) {
        throw new Error('State has duplicated elements')
    }

    switch (action.type) {
        case 'add':
            return insertBeforeIndex(state, inputIndex, action.tag)
        case 'remove':
            // Clicked X on some of the tags
            if (action.tag) {
                return removeBeforeIndex(stateCopy, stateCopy.indexOf(action.tag) + 1)
            } else {
                // Backspace
                if (inputIndex > 0) {
                    return removeBeforeIndex(stateCopy, inputIndex)
                }
            }
            return state
        case 'arrowLeft':
            return inputIndex > 0
                ? swapWithPreviousIndex(stateCopy, inputIndex)
                : state
        case 'arrowRight':
            return inputIndex < state.length - 1
                ? swapWithPreviousIndex(stateCopy, inputIndex + 1)
                : state
        default:
            throw new Error();
    }
}

function TagsInput ({
    onChange,
    initialTags=[],
    separators=['Enter', ',', ';'],
    categories=[],
    tagComponent=DefaultTag
}) {
    const [tags, dispatch] = useReducer(tagsReducer, ['_INPUT'])
    const [currentInput, setCurrentInput] = useState('');

    const [inputRef, setInputFocus] = useFocus();

    useEffect(() => {
        initialTags.forEach(i => addTag(i))
    }, []);

    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current === true) {
            isFirstRun.current = false;
            return;
        }
        onChange(tags)
    }, [tags, onChange]);

    const categorizeTag = text => {
        const category = categories.find(category => {
            return category.predicate(text)
        })

        return new CategorizedTag(text, category)
    }

    const removeTag = (tag) => {
        dispatch({
            type: 'remove',
            tag
        });
    }

    const addTag = (text) => {
        if (
            !tags.find(tag => tag.text === text) &&
            !!text
        ) {
            dispatch({
                type: 'add',
                tag: categorizeTag(text)
            });
            setCurrentInput('');
        }
    }

    const onInputChange = e => {
        const value = e.target.value;
        const lastChar = value.charAt(value.length - 1);
        if (separators.indexOf(lastChar) > -1) return;
        setCurrentInput(e.target.value);
    }

    const onBlur = e => {
        addTag(e.target.value);
    }

    const onInputKeyDown = e => {
        if (separators.indexOf(e.key) > -1) {
            addTag(e.target.value);
        }
        else if (
            e.key === 'Backspace' &&
            currentInput === ''
        ) {
            removeTag();
        }
        else if (
            e.key === 'ArrowLeft' &&
            currentInput === ''
        ) {
            dispatch({type: 'arrowLeft'})
        }
        else if (
            e.key === 'ArrowRight' &&
            currentInput === ''
        ) {
            dispatch({type: 'arrowRight'})
        }
    }

    const TagComponent = tagComponent;
    const onRemoveTag = (tag) => () => removeTag(tag)

    return (
        <div
            onClick={setInputFocus}
            role='list'
            className='tagsinput__wrapper'
        >
            {tags.map(tag => {
                return tag === '_INPUT'
                ? <input
                    key={`tagsinpout__input`}
                    ref={inputRef}
                    onKeyDown={onInputKeyDown}
                    onChange={onInputChange}
                    onBlur={onBlur}
                    value={currentInput}
                    aria-label='insert tag'
                />
                : <TagComponent
                    key={tag.text}
                    tag={tag}
                    onRemove={onRemoveTag(tag)}
                />
            })}
        </div>
    )
}

TagsInput.propTypes = {
    onChange: PropTypes.func.isRequired,
    initialTags: PropTypes.arrayOf(PropTypes.string),
    separators: PropTypes.arrayOf(PropTypes.string),
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            predicate: PropTypes.func.isRequired,
            cssStyle: PropTypes.string,
            message: PropTypes.string
        })
    )
};