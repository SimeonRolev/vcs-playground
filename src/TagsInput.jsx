import React, {useState, useEffect, useReducer} from 'react'
import PropTypes from 'prop-types'
import { useFocus } from './hooks';

export default TagsInput;

function Tag ({ tag, onRemove }) {
    const onClickRemove = () => {
        onRemove(tag);
    }

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
                onClick={onClickRemove}
            >x</span>
        </div>
    )
}

Tag.propTypes = {
    tag: PropTypes.instanceOf(CategorizedTag).isRequired,
    onRemove: PropTypes.func.isRequired
}

function CategorizedTag (text, category) {
    this.text = text;
    this.category = category;
}

function tagsReducer(state, action) {
    switch (action.type) {
      case 'add':
        return [...state, action.tag];
      case 'remove':
        return state.filter(tag => tag.text !== action.tag.text)
      default:
        throw new Error();
    }
}

function TagsInput ({
    onChange,
    initialTags=[],
    separators=['Enter', ',', ';'],
    categories=[]
}) {
    const [tags, dispatch] = useReducer(tagsReducer, [])
    const [currentInput, setCurrentInput] = useState('');

    const [inputRef, setInputFocus] = useFocus();

    useEffect(() => {
        initialTags.forEach(i => addTag(i))
    }, []);

    useEffect(() => {
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
        }
        setCurrentInput('');
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

    const onInputKeyPress = e => {
        if (separators.indexOf(e.key) > -1) {
            addTag(e.target.value);
        }
        else if (
            e.key === 'Backspace' &&
            currentInput === '' &&
            tags.length > 0
        ) {
            removeTag(tags.pop());
        }
    }

    return (
        <div
            onClick={setInputFocus}
            data-testid='tagsinput__wrapper'
            role='list'
        >
            { tags.map(tag => <Tag
                key={tag.text}
                tag={tag}
                onRemove={removeTag}
            />) }
            <input
                ref={inputRef}
                onKeyDown={onInputKeyPress}
                onChange={onInputChange}
                onBlur={onBlur}
                value={currentInput}
                aria-label='insert tag'
            />
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