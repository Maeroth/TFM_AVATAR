# Etapa 1: Build con Node.js
FROM node:18 AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias y construir el proyecto
RUN npm install
RUN npm run build

# Etapa 2: Servir la app con Nginx
FROM nginx:alpine

# Copiar la app construida desde el builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto para nginx
CMD ["nginx", "-g", "daemon off;"]
