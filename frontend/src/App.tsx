import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PastePage } from './pages/PastePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/paste/:id" element={<PastePage />} />
        <Route path="/:id" element={<PastePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
