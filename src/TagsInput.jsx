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

function insertAtIndex(array, index, elem) {
    if (index === array.length) {
        return array.concat(elem)
    }

    return array.reduce((prev, curr, i) => {
        return i === index
            ? prev.concat([elem, curr])
            : prev.concat(curr)
    }, []);
}

function removeAtIndex(array, index) {
    return array.reduce((prev, curr, i) => {
        return i === index
            ? prev
            : prev.concat(curr)
    }, []);
}

const tagsReducer = function (state, action) {
    const { tags, inputIndex } = state;

    if (new Set(tags).size !== tags.length) {
        throw new Error('State has duplicated elements')
    }

    switch (action.type) {
        case 'add':
            return {
                tags: insertAtIndex(tags, inputIndex, action.tag),
                inputIndex: inputIndex + 1
            }
        case 'remove':
            // Clicked X on some of the tags
            if (action.tag) {
                const tagIndex = tags.indexOf(action.tag);
                return {
                    tags: removeAtIndex(tags, tagIndex),
                    inputIndex: inputIndex > tagIndex
                        ? inputIndex - 1
                        : inputIndex
                }
            } else {
                // Backspace
                if (inputIndex > 0) {
                    return {
                        tags: removeAtIndex(tags, inputIndex - 1),
                        inputIndex: inputIndex - 1
                    }
                }
            }
            return state
        case 'arrowLeft':
            return {
                tags,
                inputIndex: inputIndex > 0
                    ? inputIndex - 1
                    : inputIndex
            }
        case 'arrowRight':
            return {
                tags,
                inputIndex: inputIndex < tags.length
                    ? inputIndex + 1
                    : inputIndex
            }
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
    const [tagsState, dispatch] = useReducer(tagsReducer, {tags: [], inputIndex: 0})
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
        onChange(tagsState.tags)
    }, [tagsState, onChange]);

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
            !tagsState.tags.find(tag => tag.text === text) &&
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

    const renderTag = (tag) =>< TagComponent
        key={tag.text}
        tag={tag}
        onRemove={onRemoveTag(tag)}
    />

    return (
        <div
            onClick={setInputFocus}
            role='list'
            className='tagsinput__wrapper'
        >
            { tagsState.tags.slice(0, tagsState.inputIndex).map(tag => renderTag(tag)) }
            <input
                    key={`tagsinpout__input`}
                    ref={inputRef}
                    onKeyDown={onInputKeyDown}
                    onChange={onInputChange}
                    onBlur={onBlur}
                    value={currentInput}
                    aria-label='insert tag'
            />
            { tagsState.tags.slice(tagsState.inputIndex).map(tag => renderTag(tag)) }
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