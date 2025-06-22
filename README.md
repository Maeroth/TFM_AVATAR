# README – GoAvatar

## Descripción del proyecto

Este repositorio contiene el desarrollo completo del Trabajo Fin de Máster (TFM) titulado “GoAvatar”, cuyo objetivo es permitir la creación y asesoramiento mediante avatares realistas basados en inteligencia artificial, integrando diferentes servicios cloud y tecnologías modernas.

## Funcionalidades principales

* Generación automática de vídeos con la API de D-ID
* Asesoramiento en tiempo real mediante avatar
* Selección de proveedor óptimo con sistema experto basado en reglas
* Publicación automática en X (Twitter)
* Interfaz separada para roles: admin, experto, usuario externo

## Tecnologías utilizadas

**Backend:** Node.js, Express, MongoDB Atlas, JWT, Multer, FFmpeg, Docker
**Frontend:** React, Vite, React Router, Bootstrap 5
**Otros:** API D-ID, Ngrok, Render.com

## Instalación y ejecución local

1. Clonar el repositorio:

```bash
git clone https://github.com/tu-usuario/TFM_AVATAR.git
cd TFM_AVATAR
```

2. Crear el archivo `.env` en `/backend` con:

```env
PORT=3000
MONGO_URI=...
DID_API_KEY=...
JWT_SECRET=...
NGROK_API_TOKEN=...
TWITTER_BEARER_TOKEN=...
```

3. Lanzar los contenedores:

```bash
docker-compose up --build
```

4. Acceder a:

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:3000](http://localhost:3000)


## Requisitos previos para ejecutar con Docker

Para poder ejecutar correctamente este proyecto usando contenedores, es necesario tener instalado:

* **Docker Desktop:** [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
  Compatible con Windows, macOS y WSL 2. Incluye tanto el motor Docker como Docker Compose.

* **Permisos suficientes** para ejecutar comandos Docker en terminal (modo administrador o `sudo` si es necesario).

> En sistemas Windows se recomienda:
>
> * Tener habilitada la virtualización en la BIOS.
> * Usar WSL 2 y tener Docker Desktop configurado con integración a WSL y al sistema de archivos.

Una vez Docker esté instalado y activo, el proyecto puede ejecutarse con:

```bash
docker-compose up --build
```

## Despliegue en producción

* Backend y frontend desplegados en Render.com (Docker)
* Base de datos en MongoDB Atlas (cloud)
* Comunicación entre servicios cifrada (HTTPS/TLS)

## Pruebas

* Pruebas funcionales manuales
* Simulación de webhooks
* Publicación en redes sociales automatizada

## Documentación

Disponible en la carpeta `/docs` (Memoria\_TFM.docx y anexos)

## Licencia

Proyecto académico sin fines comerciales. Cualquier uso externo debe citar este repositorio y contactar con el autor.
