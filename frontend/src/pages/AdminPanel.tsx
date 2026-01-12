import { useState, useEffect } from 'react';
import api from '../services/api';

export const AdminPanel = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
    }
  }, [selectedEvent]);

  const fetchRsvps = async (eventId: number) => {
    try {
      const response = await api.get(`/api/events/${eventId}`);
      setRsvps(response.data.rsvps || []);
    } catch (error) {
      console.error('Error cargando asistentes:', error);
      setMessage('Error cargando asistentes');
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
                <p style={{ color: '#666', fontSize: '0.9em' }}>
                  <strong>Capacidad:</strong> {selectedEvent.capacity} personas
                </p>
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
                  maxHeight: '400px',
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