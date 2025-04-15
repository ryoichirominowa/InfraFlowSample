import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Canvas from "./components/Canvas";
import Canvas2 from "./components/Canvas2";
import Canvas3 from "./components/Canvas3";
import Canvas4 from "./components/Canvas4";
import Canvas5 from "./components/Canvas5";
import Canvas6 from "./components/Canvas6";
import Canvas7 from "./components/Canvas7";
import Canvas8 from "./components/Canvas8";
import Canvas9 from "./components/Canvas9";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Canvas />} />
          <Route path="/sample2" element={<Canvas2 />} />
          <Route path="/sample3" element={<Canvas3 />} />
          <Route path="/sample4" element={<Canvas4 />} />
          <Route path="/sample5" element={<Canvas5 />} />
          <Route path="/sample6" element={<Canvas6 />} />
          <Route path="/sample7" element={<Canvas7 />} />
          <Route path="/sample8" element={<Canvas8 />} />
          <Route path="/sample9" element={<Canvas9 />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
