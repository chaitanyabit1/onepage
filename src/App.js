import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./Home/HomePage";
import Header from "./components/header/Header";
function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route exact path="/" element={<HomePage />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
