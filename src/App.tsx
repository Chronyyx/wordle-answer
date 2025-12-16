import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { WordlePage } from './pages/WordlePage';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />

        <Routes>
          <Route path="/" element={<WordlePage />} />
          <Route path="/wordle/:date" element={<WordlePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
