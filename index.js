// Importar dependencias
const connection = require('./database/connection.js');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const Message = require('./model/message');

// Crear el servidor
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3001;

// Configurar CORS
app.use(
    cors({
        origin: '*', // Asegúrate de que esta dirección coincida con la de tu frontend
        credentials: true,
    })
);

// Convertir todo a JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos
console.log('BIENVENIDO A LA API');
connection();

// Rutas
const userRoutes = require('./routes/pathUser.js');
const followRoutes = require('./routes/pathFollow.js');
const publicationRoutes = require('./routes/pathPublication.js');
const reciclajeRoutes = require('./routes/pathReciclaje');
const bodegaRoutes = require('./routes/pathBodega');
const inventarioRoutes = require('./routes/pathInventario');
const traspasoRoutes = require('./routes/pathTraspaso');
const paqueteRoutes = require('./routes/pathPaquete');
const plantaRoutes = require('./routes/pathPlanta');
const publicRoutes = require('./routes/pathPublic');
const contactoRoutes = require('./routes/pathContacto');

app.use('/api/user', userRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/publication', publicationRoutes);
app.use('/api/bodega', bodegaRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/traspaso', traspasoRoutes);
app.use('/api/paquete', paqueteRoutes);
app.use('/api/planta', plantaRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/contacto', contactoRoutes);


// Configurar Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);

    // Manejador para mensajes privados
    socket.on('private_message', async (data) => {
        const { senderId, receiverId, content } = data;

        // Guardar el mensaje en la base de datos
        const message = new Message({ senderId, receiverId, content });
        await message.save();

        // Enviar el mensaje al destinatario
        socket.to(receiverId).emit('private_message', data);
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// Hacer que escuche
server.listen(port, () => {
    console.log('Servidor de Node corriendo en el puerto ' + port);
});
