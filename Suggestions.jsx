import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'

function DefaultSuggestion({suggestion}) {
    return <div>{suggestion.text}</div>
}

function Suggestions({
    inputString='',
    allSuggestions=[],
    filterSuggestionsPredicate,
    suggestionComponent=DefaultSuggestion
}) {
    const [suggestions, setSuggestions] = useState(allSuggestions)
    
    useEffect(() => {
        setSuggestions(filterSuggestionsPredicate(inputString));
    }, [inputString, allSuggestions, filterSuggestionsPredicate])

    const SuggestionComponent = suggestionComponent;
    return (
        <div>
            { suggestions.map(suggestion => <SuggestionComponent suggestion={suggestion} />)}
        </div>
    )
}

Suggestions.propTypes = {
    inputString: PropTypes.string,
    filterSuggestionsPredicate: PropTypes.func.isRequired,
    allSuggestions: PropTypes.array
}

export default Suggestions;
