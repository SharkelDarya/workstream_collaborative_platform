const express = require('express');
const { connectDB } = require('./db/db');
const path = require('path');
const router = require('./db/router');
const socketIO = require('socket.io');
const socketHandler = require('./socket');
require('dotenv').config();

const PORT = process.env.PORT;
const app = express()
app.use(express.urlencoded({ extended: true })); // для обработки обычных HTML-форм
app.use(express.json())
app.use(express.static(path.join(__dirname, 'templates')))
app.use('/api', router);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'))
});

const start = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => console.log("Server started at port", PORT));
        
        const io = socketIO(server);
        socketHandler(io);
        
    } catch (error) {
        console.log(error)        
    }
}

start();