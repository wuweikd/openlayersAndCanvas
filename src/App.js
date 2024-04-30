import './App.css';
import TestCssInJs from "./components/TestCssInJs";
import Panel from "./components/Panel/Panel";
import Map from "./components/map/index.tsx";


function App() {
  return (
    <div className="App">
        {/*<TestCssInJs />*/}
        <Panel />
        <Map />
    </div>
  );
}

export default App;
