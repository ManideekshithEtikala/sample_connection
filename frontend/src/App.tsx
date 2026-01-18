import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Chatpage from "./components/Chatpage";
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jd-builder" element={<Chatpage />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
