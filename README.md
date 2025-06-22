# TFM_AVATAR – Generación de vídeos con avatares realistas mediante inteligencia artificial

Este repositorio contiene el desarrollo completo del Trabajo Fin de Máster (TFM) titulado **“GoAvatar”**, cuyo objetivo es permitir la creación y asesoramiento mediante avatares realistas basados en inteligencia artificial, integrando diferentes servicios cloud y tecnologías modernas.

## Funcionalidades principales

- Generación automática de vídeos a partir de texto o audio, usando la API de [D-ID](https://www.d-id.com/).
- Interacción en tiempo real con un avatar conversacional.
- Selección óptima de proveedor de servicios mediante un sistema experto basado en reglas.
- Gestión y edición de proveedores, pesos técnicos y configuración de avatares.
- Publicación automática de vídeos en redes sociales (X/Twitter).
- Interfaz separada para usuarios expertos, administradores y externos.

## Tecnologías utilizadas

### Backend
- Node.js + Express
- MongoDB Atlas
- JWT para autenticación
- Multer / FFmpeg / Axios
- Docker + Render.com

### Frontend
- React + Vite
- React Router DOM
- Bootstrap 5
- Comunicación vía RESTful API

### Otros
- D-ID API
- Ngrok (en fase de pruebas)
- GitHub para control de versiones


## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/TFM_AVATAR.git
cd TFM_AVATAR
```

### 2. Backend

```bash
cd backend
npm install
# Crear un archivo .env con tus credenciales y claves (ver ejemplo abajo)
node index.js
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Archivo `.env` (backend)

```env
PORT=3000
MONGO_URI=...
DID_API_KEY=...
JWT_SECRET=...
NGROK_API_TOKEN=...
TWITTER_BEARER_TOKEN=...
```

## Despliegue

El backend y frontend están contenedorizados con Docker y desplegados en [Render.com](https://render.com). La base de datos se aloja en [MongoDB Atlas](https://cloud.mongodb.com/).

## Pruebas

Las funcionalidades clave se han validado mediante:
- Pruebas funcionales manuales
- Simulación de webhooks y respuestas de proveedor
- Verificación de publicación automática en X/Twitter

## Documentación

Toda la memoria del proyecto (incluyendo anexos, especificaciones y diseño) está disponible en la carpeta `/docs`.

## Licencia

Proyecto académico sin fines comerciales. Cualquier uso externo debe citar este repositorio y contactar con el autor.
