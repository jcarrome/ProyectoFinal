# Eventia - Plataforma de Gestión de Eventos

Sistema completo para crear, gestionar y confirmar asistencia a eventos. Incluye funcionalidades de lista de espera, check-in de asistentes y reportes.

## 📋 Tabla de Contenidos

- [Requisitos del Sistema](#requisitos-del-sistema)
- [Tecnologías y Versiones](#tecnologías-y-versiones)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Funcionalidades](#funcionalidades)
- [Endpoints de la API](#endpoints-de-la-api)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## 🔧 Requisitos del Sistema

| Herramienta | Versión Mínima |
|-------------|----------------|
| PHP         | 8.2+           |
| Composer    | 2.0+           |
| Node.js     | 18.0+          |
| npm         | 9.0+           |

---

## 📦 Tecnologías y Versiones

### Backend (Laravel)

| Paquete               | Versión   |
|-----------------------|-----------|
| PHP                   | ^8.2      |
| Laravel Framework     | ^12.0     |
| Laravel Sanctum       | ^4.0      |
| Laravel Tinker        | ^2.10.1   |
| PHPUnit               | ^11.5.3   |
| SQLite                | 3.x       |

### Frontend (React + Vite)

| Paquete               | Versión   |
|-----------------------|-----------|
| React                 | ^19.2.0   |
| React DOM             | ^19.2.0   |
| React Router DOM      | ^7.12.0   |
| Axios                 | ^1.13.2   |
| TypeScript            | ~5.9.3    |
| Vite                  | ^7.2.4    |
| ESLint                | ^9.39.1   |

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/jcarrome/ProyectoFinal.git
cd ProyectoFinal
```

### 2. Configurar el Backend

```bash
cd eventia-backend

# Instalar dependencias de PHP
composer install

# Copiar archivo de configuración
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Crear base de datos SQLite
touch database/database.sqlite

# Ejecutar migraciones
php artisan migrate

# (Opcional) Cargar datos de ejemplo
php artisan db:seed
```

### 3. Configurar el Frontend

```bash
cd ../frontend

# Instalar dependencias de Node.js
npm install
```

---

## ▶️ Ejecución

### Opción 1: Ejecutar en terminales separadas

**Terminal 1 - Backend (Puerto 8000):**
```bash
cd eventia-backend
php artisan serve --host=0.0.0.0 --port=8000
```

**Terminal 2 - Frontend (Puerto 5173):**
```bash
cd frontend
npm run dev
```

### Opción 2: Usando el script dev de Laravel (Backend)

```bash
cd eventia-backend
composer run dev
```

### Acceder a la aplicación

- **Frontend:** http://localhost:5173
- **API Backend:** http://localhost:8000/api

### En GitHub Codespaces

Si usas Codespaces, asegúrate de que el **puerto 8000 esté público** para que el frontend pueda comunicarse con el backend.

---

## ✨ Funcionalidades

### Para Asistentes
- 🏠 **Home/Landing Page**: Ver todos los eventos disponibles con búsqueda y filtros
- 🔍 **Filtros**: Por modalidad (Presencial/Virtual/Híbrido) y fecha
- 📝 **Registro a eventos**: Confirmar asistencia con nombre y email
- ⏳ **Lista de espera**: Unirse automáticamente cuando el evento está lleno
- 📊 **Promoción automática**: Si alguien cancela, el primero en lista de espera es promovido

### Para Organizadores
- ➕ **Crear eventos**: Título, descripción, fecha, capacidad, modalidad y ubicación
- 👥 **Panel de administración**: Ver y gestionar asistentes de cada evento
- ✅ **Check-in**: Registrar la llegada de asistentes
- ❌ **Cancelar asistencia**: Liberar cupos (promueve automáticamente de lista de espera)
- 📈 **Reportes CSV**: Descargar listado de asistentes con estadísticas

---

## 🔌 Endpoints de la API

### Eventos

| Método | Endpoint                    | Descripción                          |
|--------|-----------------------------|--------------------------------------|
| GET    | `/api/events`               | Listar todos los eventos             |
| GET    | `/api/events/{id}`          | Obtener detalle de un evento         |
| POST   | `/api/events`               | Crear nuevo evento                   |
| PUT    | `/api/events/{id}`          | Actualizar evento                    |
| DELETE | `/api/events/{id}`          | Eliminar evento                      |
| GET    | `/api/events/{id}/report`   | Obtener reporte del evento           |
| GET    | `/api/events/{id}/waitlist` | Ver lista de espera del evento       |

### RSVPs (Confirmaciones de Asistencia)

| Método | Endpoint          | Descripción                                    |
|--------|-------------------|------------------------------------------------|
| POST   | `/api/rsvp`       | Confirmar asistencia (o unirse a lista espera) |
| POST   | `/api/rsvp/cancel`| Cancelar asistencia                            |
| GET    | `/api/rsvp/status`| Verificar estado de registro por email         |

### Check-in

| Método | Endpoint        | Descripción                    |
|--------|-----------------|--------------------------------|
| POST   | `/api/check-in` | Registrar check-in de asistente|

---

## 📁 Estructura del Proyecto

```
ProyectoFinal/
├── eventia-backend/          # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── EventController.php
│   │   │   ├── RsvpController.php
│   │   │   └── AttendanceController.php
│   │   └── Models/
│   │       ├── Event.php
│   │       ├── Rsvp.php
│   │       └── User.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── config/
│       └── cors.php
│
└── frontend/                  # React + TypeScript + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── Home.tsx           # Landing page con eventos
    │   │   ├── EventDetail.tsx    # Detalle y registro
    │   │   ├── CreateEvent.tsx    # Formulario crear evento
    │   │   └── AdminPanel.tsx     # Panel del organizador
    │   ├── services/
    │   │   └── api.ts             # Configuración Axios
    │   ├── App.tsx                # Rutas principales
    │   └── main.tsx               # Punto de entrada
    └── package.json
```

---

## 🧪 Pruebas Rápidas

### Probar el Backend

```bash
cd eventia-backend

# Verificar que el servidor responde
curl http://localhost:8000/api/events

# Crear un evento de prueba
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Evento de Prueba",
    "description": "Descripción del evento",
    "date_time": "2026-02-01 10:00",
    "capacity": 5,
    "modality": "Presencial",
    "location": "Sala A"
  }'

# Confirmar asistencia
curl -X POST http://localhost:8000/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "user_name": "Juan Pérez",
    "user_email": "juan@test.com"
  }'
```

### Probar el Frontend

1. Abrir http://localhost:5173
2. Ver los eventos en la página principal
3. Hacer clic en un evento para ver detalles
4. Llenar el formulario y confirmar asistencia
5. Ir al Panel de Organizador (`/admin`) para gestionar asistentes

---

## 📝 Notas Adicionales

- La base de datos usa **SQLite** para facilitar la configuración
- El archivo de base de datos se crea en `eventia-backend/database/database.sqlite`
- CORS está configurado para permitir todas las conexiones (`*`)
- El frontend detecta automáticamente la URL del backend en Codespaces

---
