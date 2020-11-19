import './App.css';
import CopyJob from './copy-job/CopyJob';

import progressTracker from './copy-job/mocks/progress-tracker'

function App() {
  return (
    <div className="App">

        <CopyJob
          initialMessage={{
            "job": {
              "uuid": "uuid",
              "state": "INIT",
              "errors": [
                'file.jpg',
                'folder/file.jpg'
              ]
            }
          }}
          progressTrackerJob={{
            id: 'uuid',
            update: () => {}
          }}
        ></CopyJob>

    </div>
  );
}

export default App;
