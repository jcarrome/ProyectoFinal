import { useState, useEffect } from 'react';
import api from '../services/api';

export const EventDetail = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/events');
      setEvents(response.data.data || []);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedEvent(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
      setMessage('Error cargando eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName || !userEmail) {
      setMessage('Por favor completa todos los campos');
      return;
    }

    if (!selectedEvent) {
      setMessage('Selecciona un evento primero');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/rsvp', {
        event_id: selectedEvent.id,
        user_name: userName,
        user_email: userEmail
      });
      setMessage('✓ ¡RSVP confirmado exitosamente!');
      setUserName('');
      setUserEmail('');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
      }, 3000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al confirmar asistencia';
      setMessage(errorMsg);
      console.error('Error en RSVP:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 30px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#1a1a1a', fontSize: '2.2em', marginBottom: '10px', fontWeight: '600' }}>Confirmación de Asistencia</h1>
        <p style={{ color: '#666', fontSize: '1em' }}>Selecciona un evento y confirma tu participación</p>
      </div>

      {message && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          backgroundColor: message.includes('✓') ? '#ecfdf5' : '#fee',
          border: `1px solid ${message.includes('✓') ? '#d1fae5' : '#fcc'}`,
          borderRadius: '6px',
          color: message.includes('✓') ? '#065f46' : '#c33',
          fontSize: '0.95em',
          fontWeight: '500'
        }}>
          {message}
        </div>
      )}

      {loading && <p style={{ color: '#666', textAlign: 'center' }}>Cargando...</p>}

      {events.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#999',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <p style={{ fontSize: '1em' }}>No hay eventos disponibles. Crea uno primero en "Gestión de Eventos"</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          {/* Panel de selección de eventos */}
          <div>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.3em', marginBottom: '16px', fontWeight: '600' }}>Eventos Disponibles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {events.map(event => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: selectedEvent?.id === event.id ? '#333' : 'white',
                    color: selectedEvent?.id === event.id ? 'white' : '#333',
                    border: `1px solid ${selectedEvent?.id === event.id ? '#333' : '#ddd'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.95em',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEvent?.id !== event.id) {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEvent?.id !== event.id) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{event.title}</div>
                  <div style={{ fontSize: '0.85em', opacity: 0.8, marginTop: '4px' }}>
                    {new Date(event.date_time).toLocaleDateString('es-ES', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Panel de detalles y RSVP */}
          <div>
            {selectedEvent && (
              <>
                {/* Detalles del evento */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '30px',
                  marginBottom: '30px'
                }}>
                  <h2 style={{ color: '#1a1a1a', fontSize: '1.6em', marginBottom: '16px', fontWeight: '600' }}>
                    {selectedEvent.title}
                  </h2>

                  {selectedEvent.description && (
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.95em' }}>
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <div style={{ borderLeft: '3px solid #333', paddingLeft: '16px' }}>
                      <p style={{ color: '#999', fontSize: '0.85em', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase' }}>📅 Fecha</p>
                      <p style={{ color: '#1a1a1a', fontSize: '1em', fontWeight: '600' }}>
                        {new Date(selectedEvent.date_time).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p style={{ color: '#999', fontSize: '0.9em', marginTop: '4px' }}>
                        {new Date(selectedEvent.date_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div style={{ borderLeft: '3px solid #333', paddingLeft: '16px' }}>
                      <p style={{ color: '#999', fontSize: '0.85em', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase' }}>📍 Modalidad</p>
                      <p style={{ color: '#1a1a1a', fontSize: '1em', fontWeight: '600' }}>{selectedEvent.modality}</p>
                    </div>
                    <div style={{ borderLeft: '3px solid #333', paddingLeft: '16px' }}>
                      <p style={{ color: '#999', fontSize: '0.85em', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase' }}>📌 Ubicación</p>
                      <p style={{ color: '#1a1a1a', fontSize: '1em', fontWeight: '600' }}>{selectedEvent.location}</p>
                    </div>
                    <div style={{ borderLeft: '3px solid #333', paddingLeft: '16px' }}>
                      <p style={{ color: '#999', fontSize: '0.85em', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase' }}>👥 Capacidad</p>
                      <p style={{ color: '#1a1a1a', fontSize: '1em', fontWeight: '600' }}>{selectedEvent.capacity} personas</p>
                    </div>
                  </div>
                </div>

                {/* Formulario RSVP */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  padding: '30px'
                }}>
                  <h3 style={{ color: '#1a1a1a', fontSize: '1.2em', marginBottom: '20px', fontWeight: '600' }}>Confirmar Asistencia</h3>
                  <form onSubmit={handleRSVP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', color: '#333', fontSize: '0.9em', fontWeight: '500' }}>Nombre</label>
                      <input
                        type="text"
                        placeholder="Tu nombre completo"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '0.95em',
                          fontFamily: 'inherit',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#999'}
                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', color: '#333', fontSize: '0.9em', fontWeight: '500' }}>Email</label>
                      <input
                        type="email"
                        placeholder="tu.email@ejemplo.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '0.95em',
                          fontFamily: 'inherit',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#999'}
                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '12px',
                        backgroundColor: submitted ? '#065f46' : '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.95em',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        opacity: loading ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!loading && !submitted) {
                          e.currentTarget.style.backgroundColor = '#555';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!submitted) {
                          e.currentTarget.style.backgroundColor = '#333';
                        }
                      }}
                    >
                      {submitted ? '✓ Asistencia Confirmada' : loading ? 'Confirmando...' : 'Confirmar Asistencia'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};