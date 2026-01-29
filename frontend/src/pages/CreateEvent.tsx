import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', date_time: '', capacity: 0, modality: 'Presencial', location: '', price: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones del frontend con mensajes claros
    const errores: string[] = [];
    
    if (!formData.title.trim()) {
      errores.push('El título del evento es obligatorio.');
    }
    if (formData.price<0) {
      errores.push('El precio no puede ser negativo.');
    }
    
    if (!formData.date_time) {
      errores.push('La fecha y hora del evento es obligatoria.');
    }
    
    if (!formData.location.trim()) {
      errores.push('La ubicación o enlace es obligatorio.');
    }
    
    if (!formData.capacity || formData.capacity < 1) {
      errores.push('El cupo debe ser de al menos 1 persona.');
    }
    
    if (errores.length > 0) {
      setMessage('• ' + errores.join('\n• '));
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      // Convertir formato datetime-local (2026-01-12T14:30) a formato Laravel (2026-01-12 14:30)
      const formattedData = {
        ...formData,
        date_time: formData.date_time.replace('T', ' ')
      };
      const response = await api.post('/api/events', formattedData);
      const newEventId = response.data.data?.id || response.data.id;
      setMessage('✓ ¡Evento creado correctamente! Redirigiendo...');
      setMessageType('success');
      setFormData({ title: '', description: '', date_time: '', capacity: 0, modality: 'Presencial', location: '', price: 0 });
      // Redirigir al panel de admin después de 1.5 segundos
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error: any) {
      // Manejar errores de validación de Laravel
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n• ');
        setMessage('• ' + errorMessages);
      } else {
        const errorMsg = error.response?.data?.message || 'Error al crear el evento. Por favor intenta de nuevo.';
        setMessage(errorMsg);
      }
      setMessageType('error');
      console.error('Error en create event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 30px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '35px' }}>
        <h1 style={{ color: '#1a1a1a', fontSize: '2em', marginBottom: '8px', fontWeight: '600' }}>Crear Nuevo Evento</h1>
        <p style={{ color: '#666', fontSize: '0.95em' }}>Publica tu evento y atrae asistentes</p>
      </div>

      {message && (
        <div style={{
          marginBottom: '20px',
          padding: '14px 18px',
          backgroundColor: messageType === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${messageType === 'success' ? '#d1fae5' : '#fecaca'}`,
          borderRadius: '8px',
          color: messageType === 'success' ? '#065f46' : '#991b1b',
          fontSize: '0.95em',
          fontWeight: '500',
          whiteSpace: 'pre-line',
          lineHeight: '1.6'
        }}>
          {messageType === 'error' && <span style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Corrige los siguientes errores:</span>}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '18px',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', color: '#333', fontSize: '0.9em', fontWeight: '500' }}>Título del evento *</label>
          <input 
            type="text" 
            placeholder="Ej: Conferencia Tech 2026" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
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
          <label style={{ display: 'block', marginBottom: '6px', color: '#333', fontSize: '0.9em', fontWeight: '500' }}>Fecha y hora *</label>
          <input 
            type="datetime-local" 
            value={formData.date_time}
            onChange={e => setFormData({...formData, date_time: e.target.value})}
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
          <label style={{ display: 'block', marginBottom: '6px', color: '#333', fontSize: '0.9em', fontWeight: '500' }}>Descripción</label>
          <textarea
            placeholder="Describe el evento, agenda o speakers"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            style={{
              width: '100%',
              padding: '11px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.95em',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
              minHeight: '90px',
              resize: 'vertical'
            }}
            onFocus={(e) => e.target.style.borderColor = '#999'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#333', fontSize: '0.9em', fontWeight: '500' }}>Modalidad *</label>
            <select
              value={formData.modality}
              onChange={e => setFormData({...formData, modality: e.target.value})}
              style={{
                width: '100%',
                padding: '11px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.95em',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = '#999'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            >
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#333', fontSize: '0.9em', fontWeight: '500' }}>Ubicación / enlace *</label>
            <input 
              type="text" 
              placeholder="Ej: Auditorio A / Zoom link" 
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
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
            <label style={{ display: 'block', marginBottom: '6px', color: '#333', fontSize: '0.9em', fontWeight: '500' }}>Cupo máximo *</label>
            <input 
              type="number" 
              placeholder="100" 
              value={formData.capacity || ''}
              onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
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
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', color: '#333', fontSize: '0.9em', fontWeight: '500' }}>Precio*</label>
          <input 
            type="int" 
            placeholder="Ej: Conferencia Tech 2026" 
            value={formData.price}
            onChange={e => setFormData({...formData, price: e.target.value})}
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
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95em',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            marginTop: '8px',
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#555';
          }}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
        >
          {loading ? 'Publicando...' : 'Publicar Evento'}
        </button>
      </form>
    </div>
  );
};