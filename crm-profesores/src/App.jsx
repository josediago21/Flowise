import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AlumnoDetail from './pages/AlumnoDetail';
import Horarios from './pages/Horarios';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alumno/:id" element={<AlumnoDetail />} />
            <Route path="/horarios" element={<Horarios />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
