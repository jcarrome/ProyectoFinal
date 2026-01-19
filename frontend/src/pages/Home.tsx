import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Event {
  id: number;
  title: string;
  description: string;
  date_time: string;
  capacity: number;
  modality: string;
  location: string;
  is_cancelled: boolean;
}

export const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, modalityFilter, dateFilter, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/events');
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (modalityFilter) {
      filtered = filtered.filter(event => event.modality === modalityFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(event => 
        event.date_time.startsWith(dateFilter)
      );
    }

    setFilteredEvents(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModalityStyle = (modality: string) => {
    switch (modality) {
      case 'Presencial': return { backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #d1fae5' };
      case 'Virtual': return { backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #dbeafe' };
      case 'Híbrido': return { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' };
    }
  };

  return (
    <div style={{ padding: '40px 30px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '35px' }}>
        <h1 style={{ color: '#1a1a1a', fontSize: '2em', marginBottom: '8px', fontWeight: '600' }}>
          Eventos Disponibles
        </h1>
        <p style={{ color: '#666', fontSize: '0.95em' }}>
          Explora y encuentra eventos que te interesen
        </p>
      </div>

      {/* Filtros */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          alignItems: 'end'
        }}>
          {/* Búsqueda */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#333', fontSize: '0.9em', fontWeight: '500' }}>
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.95em',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#999'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* Filtro por Modalidad */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#333', fontSize: '0.9em', fontWeight: '500' }}>
              Modalidad
            </label>
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.95em',
                fontFamily: 'inherit',
                backgroundColor: 'white',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Todas las modalidades</option>
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>

          {/* Filtro por Fecha */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#333', fontSize: '0.9em', fontWeight: '500' }}>
              Fecha
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.95em',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Limpiar Filtros */}
          {(searchTerm || modalityFilter || dateFilter) && (
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: 'transparent', fontSize: '0.9em' }}>
                .
              </label>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setModalityFilter('');
                  setDateFilter('');
                }}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.95em',
                  cursor: 'pointer',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontWeight: '500',
                  fontFamily: 'inherit'
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
          Cargando eventos...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>No se encontraron eventos</h3>
          <p style={{ color: '#999' }}>
            {searchTerm || modalityFilter || dateFilter
              ? 'Intenta ajustar tus filtros de búsqueda'
              : 'No hay eventos disponibles en este momento'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px', color: '#666', fontSize: '0.9em' }}>
            Mostrando {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
          </div>
          
          {/* Grid de Tarjetas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate('/detalle', { state: { eventId: event.id } })}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Header de la tarjeta */}
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.1em',
                      fontWeight: '600',
                      color: '#1a1a1a',
                      lineHeight: '1.4'
                    }}>
                      {event.title}
                    </h3>
                    <span style={{
                      ...getModalityStyle(event.modality),
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.75em',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      marginLeft: '10px'
                    }}>
                      {event.modality}
                    </span>
                  </div>
                  <p style={{
                    color: '#666',
                    fontSize: '0.9em',
                    lineHeight: '1.5',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {event.description || 'Sin descripción'}
                  </p>
                </div>

                {/* Footer de la tarjeta */}
                <div style={{
                  padding: '15px 20px',
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85em', color: '#666' }}>
                    <div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Fecha:</strong> {formatDate(event.date_time)}
                      </div>
                      <div>
                        <strong>Lugar:</strong> {event.location}
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'right',
                      color: '#333',
                      fontWeight: '500'
                    }}>
                      {event.capacity} cupos
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
