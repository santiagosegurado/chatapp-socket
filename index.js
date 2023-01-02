import express from 'express';
const app = express();
import { createServer } from 'http';
const server = createServer(app);
import { Server } from "socket.io";
const io = new Server(server);
import * as dotenv from "dotenv";
dotenv.config();

let users = [];

const addUsers = (socketId, userId) => {
  !users.some(user => user.userId === userId) && users.push({socketId, userId});
}

const removeUsers = (socketId) => {
  users = users.filter(user => user.socketId !== socketId)
}

const getUser = (userId) => {
  return users.find(user => user.userId === userId);
}

io.on('connection', (socket) => {
  
  console.log('Se conceto un usuario')

  // Guardar usuarios cuando se conecta
  socket.on('addUser', userId => {
    addUsers(socket.id, userId);
    io.emit('getUsers', users);

  })
  

  // Mandar y recibir mensajes
  socket.on('sendMessage', ({senderId, receiverId, text}) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit('getMessage',{
      senderId,
      text
    })
  })

  // Eliminar usuarios cuando se desconecta
  socket.on('disconnect', () => {
    console.log(socket.id + ' Se desconecto' )
    removeUsers(socket.id);
    io.emit('getUsers', users);
  })
});

server.listen( process.env.PORT || 3000, () => {
  console.log('listening on *: ' + process.env.PORT || 3001);
});