const express = require("express");
const cors = require("cors");
const app = express();
var http = require('http').createServer(app);
var io = require("socket.io").listen(http);

voices = [];

app.use(cors());

// app.get("/", (req, res) => {
//     res.sendFile(__dirname + ".\client\index.html");
// });

// app.get("/", (req, res) => {
//     res.sendFile(__dirname + ".\client\dist\app.js");
// });

// app.get("/", (req, res) => {
//     res.sendFile(__dirname + "./client/dist/app.css");
// });

app.get("/voices", (req, res) => {
    res.send(voices);
});

io.on('connection', (socket) => {
    console.log('A user connected');
    let connected = socket.client.conn.server.clientsCount;
    io.emit('user', connected);

    socket.on('disconnect', () => {
        let disconnected = socket.client.conn.server.clientsCount;
        io.emit('user', disconnected);
    });

    socket.on('audioMessage', (audio) => {
        voices.push({
            timeStamp: new Date().toISOString(),
            audioBlob: audio
        });
        io.emit('audioMessage', audio);
    });
});

http.listen(3000);