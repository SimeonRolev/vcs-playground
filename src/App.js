import logo from './logo.svg';
import './App.css';
import TagsInput from './TagsInput';
import CopyJob from './copy-job/CopyJob';

function App() {
  return (
    <div className="App">

      <CopyJob
        progressTrackerJob={{
          update: function() {},
          state: function() {},
        }}
        initialMessage={
          {
            'job': {
                'uuid': 'uuid',
                'state': 'INIT',
                'progress': 0
            }
          }
        }
      />

    </div>
  );
}

export default App;
