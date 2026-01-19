import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const AdminPanel = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchEvents();
  }, []);

  // Traer eventos del backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/events');
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      setMessage('Error cargando eventos');
    } finally {
      setLoading(false);
    }
  };

  // Traer RSVPs cuando se selecciona un evento
  useEffect(() => {
    if (selectedEvent) {
      fetchRsvps(selectedEvent.id);
      fetchWaitlist(selectedEvent.id);
    }
  }, [selectedEvent]);

  const fetchRsvps = async (eventId: number) => {
    try {
      const response = await api.get(`/api/events/${eventId}`);
      // Filtrar solo confirmados (no cancelados ni en espera)
      const allRsvps = response.data.rsvps || [];
      setRsvps(allRsvps.filter((r: any) => r.status === 'confirmado'));
    } catch (error) {
      console.error('Error cargando asistentes:', error);
      setMessage('Error cargando asistentes');
    }
  };

  const fetchWaitlist = async (eventId: number) => {
    try {
      const response = await api.get(`/api/events/${eventId}/waitlist`);
      setWaitlist(response.data.lista_espera || []);
    } catch (error) {
      console.error('Error cargando lista de espera:', error);
      setWaitlist([]);
    }
  };

  // Registrar check-in
  const handleCheckIn = async (rsvpId: number) => {
    try {
      setLoading(true);
      await api.post('/api/check-in', { rsvp_id: rsvpId });
      setMessage('✓ Check-in registrado correctamente');
      if (selectedEvent) {
        await fetchRsvps(selectedEvent.id);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error en check-in:', error);
      setMessage('Error registrando check-in');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar RSVP (esto promueve al siguiente en lista de espera)
  const handleCancelRsvp = async (rsvpId: number, userName: string) => {
    if (!confirm(`¿Estás seguro de cancelar la asistencia de ${userName}? Si hay personas en lista de espera, se promoverá al siguiente.`)) {
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/api/rsvp/cancel', { rsvp_id: rsvpId });
      const data = response.data;
      
      if (data.promovido) {
        setMessage(`✓ Asistencia cancelada. ${data.promovido.user_name} (${data.promovido.user_email}) ha sido promovido de la lista de espera.`);
      } else {
        setMessage('✓ Asistencia cancelada correctamente');
      }
      
      if (selectedEvent) {
        await fetchRsvps(selectedEvent.id);
        await fetchWaitlist(selectedEvent.id);
      }
      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      console.error('Error cancelando RSVP:', error);
      setMessage(error.response?.data?.message || 'Error cancelando asistencia');
    } finally {
      setLoading(false);
    }
  };

  // Descargar reporte
  const handleDownloadReport = async () => {
    if (!selectedEvent) {
      setMessage('Selecciona un evento primero');
      return;
    }
    try {
      const response = await api.get(`/api/events/${selectedEvent.id}/report`);
      const data = response.data;
      const csv = generateCSV(data);
      downloadCSV(csv, `reporte_${selectedEvent.title}.csv`);
      setMessage('✓ Reporte descargado');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error descargando reporte:', error);
      setMessage('Error descargando reporte');
    }
  };

  const generateCSV = (data: any) => {
    let csv = 'Evento,Confirmados,Presentes,Porcentaje\n';
    csv += `"${data.evento}",${data.resumen.total_confirmados},${data.resumen.total_presentes},${data.resumen.porcentaje_asistencia}\n\n`;
    csv += 'Asistentes\nNombre,Email,Presente\n';
    data.listado_asistentes.forEach((rsvp: any) => {
      csv += `"${rsvp.user_name}","${rsvp.user_email}",${rsvp.checked_in ? 'Sí' : 'No'}\n`;
    });
    return csv;
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div style={{ padding: '40px 30px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#1a1a1a', fontSize: '2em', marginBottom: '8px', fontWeight: '600' }}>Panel del Organizador</h1>
        <p style={{ color: '#666', fontSize: '0.95em' }}>Gestiona eventos, asistentes y confirma asistencia</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Panel de selección de eventos */}
        <div>
          <h2 style={{ color: '#1a1a1a', fontSize: '1.3em', marginBottom: '16px', fontWeight: '600' }}>Eventos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {events.length === 0 ? (
              <p style={{ color: '#999', fontSize: '0.95em' }}>No hay eventos creados</p>
            ) : (
              events.map(event => (
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
              ))
            )}
          </div>
        </div>

        {/* Panel de asistentes y acciones */}
        <div>
          {selectedEvent ? (
            <>
              <h2 style={{ color: '#1a1a1a', fontSize: '1.3em', marginBottom: '16px', fontWeight: '600' }}>
                {selectedEvent.title}
              </h2>

              <div style={{
                backgroundColor: '#f9f9f9',
                padding: '16px',
                borderRadius: '6px',
                marginBottom: '20px',
                border: '1px solid #e0e0e0'
              }}>
                <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '8px' }}>
                  <strong>Fecha:</strong> {new Date(selectedEvent.date_time).toLocaleDateString('es-ES')} {new Date(selectedEvent.date_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '8px' }}>
                  <strong>Modalidad:</strong> {selectedEvent.modality}
                </p>
                <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '8px' }}>
                  <strong>Ubicación:</strong> {selectedEvent.location}
                </p>
                <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '12px' }}>
                  <strong>Capacidad:</strong> {selectedEvent.capacity} personas
                </p>
                <button
                  onClick={() => navigate('/detalle', { state: { eventId: selectedEvent.id } })}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#333',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85em',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#333';
                  }}
                >
                  👁 Ver página pública del evento
                </button>
              </div>

              <h3 style={{ color: '#1a1a1a', fontSize: '1.1em', marginBottom: '12px', fontWeight: '600' }}>
                Asistentes ({rsvps.length})
              </h3>

              {rsvps.length === 0 ? (
                <p style={{ color: '#999', fontSize: '0.95em', marginBottom: '20px' }}>No hay asistentes confirmados aún</p>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '20px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {rsvps.map((rsvp: any) => (
                    <div
                      key={rsvp.id}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: rsvp.checked_in ? '#ecfdf5' : 'white',
                        border: `1px solid ${rsvp.checked_in ? '#d1fae5' : '#e0e0e0'}`,
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <p style={{ color: '#1a1a1a', fontWeight: '500', margin: '0 0 4px 0' }}>
                          {rsvp.user_name}
                        </p>
                        <p style={{ color: '#999', fontSize: '0.85em', margin: '0' }}>
                          {rsvp.user_email}
                        </p>
                        {rsvp.checked_in && (
                          <p style={{ color: '#065f46', fontSize: '0.85em', margin: '4px 0 0 0', fontWeight: '500' }}>
                            ✓ Presente
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!rsvp.checked_in && (
                          <button
                            onClick={() => handleCheckIn(rsvp.id)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#333',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85em',
                              fontWeight: '500',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
                          >
                            Check-in
                          </button>
                        )}
                        <button
                          onClick={() => handleCancelRsvp(rsvp.id, rsvp.user_name)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85em',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sección de Lista de Espera */}
              <h3 style={{ color: '#1a1a1a', fontSize: '1.1em', marginBottom: '12px', marginTop: '24px', fontWeight: '600' }}>
                Lista de Espera ({waitlist.length})
              </h3>

              {waitlist.length === 0 ? (
                <p style={{ color: '#999', fontSize: '0.95em', marginBottom: '20px' }}>No hay personas en lista de espera</p>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '20px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {waitlist.map((item: any, index: number) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <p style={{ color: '#1a1a1a', fontWeight: '500', margin: '0 0 4px 0' }}>
                          <span style={{ 
                            backgroundColor: '#f59e0b', 
                            color: 'white', 
                            padding: '2px 8px', 
                            borderRadius: '10px', 
                            fontSize: '0.8em',
                            marginRight: '8px'
                          }}>
                            #{index + 1}
                          </span>
                          {item.user_name}
                        </p>
                        <p style={{ color: '#999', fontSize: '0.85em', margin: '0' }}>
                          {item.user_email}
                        </p>
                      </div>
                      <span style={{ color: '#d97706', fontSize: '0.85em', fontWeight: '500' }}>
                        En espera
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleDownloadReport}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#555',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.95em',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#777'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#555'}
              >
                📊 Descargar Reporte CSV
              </button>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              <p style={{ fontSize: '1em' }}>Selecciona un evento para ver y gestionar asistentes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};