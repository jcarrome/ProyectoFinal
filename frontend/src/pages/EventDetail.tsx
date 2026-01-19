import { useState, useEffect } from 'react';
import api from '../services/api';

interface WaitlistInfo {
  capacidad: number;
  confirmados: number;
  cupos_disponibles: number;
  en_lista_espera: number;
}

export const EventDetail = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning'>('success');
  const [submitted, setSubmitted] = useState(false);
  const [waitlistInfo, setWaitlistInfo] = useState<WaitlistInfo | null>(null);
  const [isInWaitlist, setIsInWaitlist] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchWaitlistInfo(selectedEvent.id);
    }
  }, [selectedEvent]);

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
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWaitlistInfo = async (eventId: number) => {
    try {
      const response = await api.get(`/api/events/${eventId}/waitlist`);
      setWaitlistInfo(response.data);
    } catch (error) {
      console.error('Error cargando info de lista de espera:', error);
    }
  };

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName || !userEmail) {
      setMessage('Por favor completa todos los campos');
      setMessageType('error');
      return;
    }

    if (!selectedEvent) {
      setMessage('Selecciona un evento primero');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/rsvp', {
        event_id: selectedEvent.id,
        user_name: userName,
        user_email: userEmail
      });
      
      if (response.data.en_lista_espera) {
        setMessage(`Has sido agregado a la lista de espera en la posición #${response.data.posicion_en_espera}. Te notificaremos cuando se libere un cupo.`);
        setMessageType('warning');
        setIsInWaitlist(true);
      } else {
        setMessage('¡Tu asistencia ha sido confirmada exitosamente!');
        setMessageType('success');
      }
      
      setUserName('');
      setUserEmail('');
      setSubmitted(true);
      
      // Actualizar info de waitlist
      fetchWaitlistInfo(selectedEvent.id);
      
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        setIsInWaitlist(false);
      }, 5000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al confirmar asistencia';
      setMessage(errorMsg);
      setMessageType('error');
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
          backgroundColor: messageType === 'success' ? '#ecfdf5' : messageType === 'warning' ? '#fef3c7' : '#fee',
          border: `1px solid ${messageType === 'success' ? '#d1fae5' : messageType === 'warning' ? '#fde68a' : '#fcc'}`,
          borderRadius: '6px',
          color: messageType === 'success' ? '#065f46' : messageType === 'warning' ? '#92400e' : '#c33',
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
                      <p style={{ color: '#999', fontSize: '0.85em', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase' }}>Fecha</p>
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
                      <p style={{ color: '#999', fontSize: '0.85em', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase' }}>Modalidad</p>
                      <p style={{ color: '#1a1a1a', fontSize: '1em', fontWeight: '600' }}>{selectedEvent.modality}</p>
                    </div>
                    <div style={{ borderLeft: '3px solid #333', paddingLeft: '16px' }}>
                      <p style={{ color: '#999', fontSize: '0.85em', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase' }}>Ubicación</p>
                      <p style={{ color: '#1a1a1a', fontSize: '1em', fontWeight: '600' }}>{selectedEvent.location}</p>
                    </div>
                    <div style={{ borderLeft: '3px solid #333', paddingLeft: '16px' }}>
                      <p style={{ color: '#999', fontSize: '0.85em', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase' }}>Capacidad</p>
                      <p style={{ color: '#1a1a1a', fontSize: '1em', fontWeight: '600' }}>{selectedEvent.capacity} personas</p>
                      {waitlistInfo && (
                        <div style={{ marginTop: '8px' }}>
                          <p style={{ 
                            color: waitlistInfo.cupos_disponibles > 0 ? '#065f46' : '#dc2626', 
                            fontSize: '0.85em',
                            fontWeight: '500'
                          }}>
                            {waitlistInfo.cupos_disponibles > 0 
                              ? `${waitlistInfo.cupos_disponibles} cupos disponibles`
                              : 'Sin cupos disponibles'}
                          </p>
                          {waitlistInfo.en_lista_espera > 0 && (
                            <p style={{ color: '#92400e', fontSize: '0.85em', marginTop: '4px' }}>
                              {waitlistInfo.en_lista_espera} en lista de espera
                            </p>
                          )}
                        </div>
                      )}
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
                      {submitted ? (isInWaitlist ? 'En lista de espera' : 'Asistencia Confirmada') : loading ? 'Confirmando...' : (waitlistInfo && waitlistInfo.cupos_disponibles === 0 ? 'Unirse a lista de espera' : 'Confirmar Asistencia')}
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