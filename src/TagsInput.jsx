import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'

export default TagsInput;

function Tag ({ tag, onRemove }) {
    const onClickRemove = () => {
        onRemove(tag.text);
    }

    const cssStyle = tag.category && tag.category.cssStyle;

    return (
        <div className={['tagsinput__tag', cssStyle].join(' ')}>
            {tag.text}
            <span onClick={onClickRemove}>x</span>
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

function TagsInput ({
    onChange,
    initialTags=[],
    separators=['Enter', ',', ';'],
    categories=[]
}) {
    const [tags, setTags] = useState(initialTags)
    const [currentInput, setCurrentInput] = useState('');

    useEffect(() => {
        initialTags.forEach(i => addTag(i))
    }, [initialTags]);  // eslint-disable-line

    useEffect(() => {
        onChange(tags)
    }, [tags, onChange]);

    const categorizeTag = text => {
        const category = categories.find(category => {
            return category.predicate(text)
        })

        return new CategorizedTag(text, category)
    }

    const removeTag = (text) => {
        setTags(tags.filter(tag => tag.text !== text))
    }

    const addTag = (text) => {
        if (!tags.find(tag => tag.text === text)) {
            setTags([...tags, categorizeTag(text)]);
        }
        setCurrentInput('');
    }

    const onInputChange = e => {
        const value = e.target.value;
        const lastChar = value.charAt(value.length - 1);
        if (separators.indexOf(lastChar) > -1) return;
        setCurrentInput(e.target.value);
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
            removeTag(tags.pop().text);
        }
    }

    return (
        <div>
            { tags.map(tag => <Tag
                key={tag.text}
                tag={tag}
                onRemove={removeTag}
            />) }
            <input
                onKeyPress={onInputKeyPress}
                onChange={onInputChange}
                value={currentInput}
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