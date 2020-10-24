import logo from './logo.svg';
import './App.css';
import TagsInput from './TagsInput';

function App() {
  return (
    <div className="App">

      <TagsInput  
        initialTags={['first', 'second']}            
        categories={[
          {
            cssStyle: 'error',
            category: 'TOO_LONG',
            predicate: tag => tag.length > 20,
            message: 'The tag is longer than 20 symbols'
          }
        ]
      }
      onChange={items => console.log(items)}
      />
    </div>
  );
}

export default App;
