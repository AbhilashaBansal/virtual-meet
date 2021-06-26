const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.use('/peerjs', peerServer);
const { v4: uuidV4 } = require('uuid')

// middlewares
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.set('view engine', 'ejs');

app.use("/", express.static(__dirname + '/public'));

// request to create a call
app.get('/create_call', (req, res) => {
    res.redirect(`/${uuidV4()}`);
})
  
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room } );
})

// socket connection
io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        console.log("A user is connected:", userName, "User ID:", userId, "Room ID:", roomId);
        
        socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

        // add messages functionality

        // add disconnect fnlity
    })
})

const port = process.env.PORT || 3000;
server.listen(port, ()=>{
    console.log("Server started at: http://localhost:"+port);
});
