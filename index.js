const express = require('express');
const { connectDB } = require('./db/db')
const path = require('path');
const router = require('./db/router')
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
        app.listen(PORT, () => console.log("Server started at port", PORT));
    } catch (error) {
        console.log(error)        
    }
}

start();