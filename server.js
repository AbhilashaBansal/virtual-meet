const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const { v4: uuidV4 } = require('uuid')

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.set('view engine', 'ejs');

app.use("/", express.static(__dirname + '/public'));

app.get('/create_call', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})
  
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

server.listen(3000, ()=>{
    console.log("Server started");
});
