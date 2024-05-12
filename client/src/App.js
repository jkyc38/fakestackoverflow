// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************

import FakeStackOverflow from "./components/FakeStackOverflow";
import "./stylesheets/App.css";
function App() {
  return (
    <section className="fakeso">
      <FakeStackOverflow />
    </section>
  );
}

export default App;
