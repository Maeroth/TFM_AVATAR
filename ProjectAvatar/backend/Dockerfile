FROM node:18

# Crear directorio de trabajo
WORKDIR /app

# Copiar los archivos del backend
COPY . .

# Instalar dependencias
RUN npm install

# Exponer el puerto en el que escucha Express (ajústalo si usas otro)
EXPOSE 5000

# Comando para iniciar la app (ajusta si usas otro archivo)
CMD ["npm", "start"]
