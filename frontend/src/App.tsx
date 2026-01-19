import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateEvent } from './pages/CreateEvent';
import { EventDetail } from './pages/EventDetail';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh', backgroundColor: '#fafafa' }}>
        {/* Navegación Profesional */}
        <nav style={{ 
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '16px 30px', 
          background: 'white', 
          color: '#333',
          display: 'flex',
          gap: '30px',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <Link to="/" style={{ color: '#333', textDecoration: 'none', fontWeight: '500', fontSize: '0.95em', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#666'} onMouseLeave={(e) => e.currentTarget.style.color = '#333'}>
            Inicio
          </Link>
          <Link to="/crear" style={{ color: '#333', textDecoration: 'none', fontWeight: '500', fontSize: '0.95em', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#666'} onMouseLeave={(e) => e.currentTarget.style.color = '#333'}>
            Gestión de Eventos
          </Link>
          <Link to="/detalle" style={{ color: '#333', textDecoration: 'none', fontWeight: '500', fontSize: '0.95em', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#666'} onMouseLeave={(e) => e.currentTarget.style.color = '#333'}>
            Confirmación de Asistencia
          </Link>
          <Link to="/admin" style={{ color: '#333', textDecoration: 'none', fontWeight: '500', fontSize: '0.95em', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#666'} onMouseLeave={(e) => e.currentTarget.style.color = '#333'}>
            Panel de Control
          </Link>
        </nav>

        {/* Contenedor de las vistas */}
        <div style={{ padding: '0', minHeight: 'calc(100vh - 80px)', backgroundColor: '#ffffff', marginTop: '0' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/crear" element={<CreateEvent />} />
            <Route path="/detalle" element={<EventDetail />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;