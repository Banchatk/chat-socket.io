// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log('Server Started', port);
});

// Routing
// app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendfile('index.html');
});

// Chatroom

users = [];
connections = [];

io.on('connection', (socket) => {
  connections.push(socket);


  socket.on('disconnect',function(data) {
    users.splice(users.indexOf(socket.username),1);
    io.sockets.emit('login', users);
    connections.splice(connections.indexOf(socket), 1);
  });

  socket.on('new message', (data) => {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('add user', (username) => {
    socket.username = username;
    users.push(socket.username);
    io.sockets.emit('login', users);
  });

});
