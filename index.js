const express = require('express');
const { connectDB } = require('./db/db')
const router = require('./db/router')
require('dotenv').config();

const PORT = process.env.PORT;
const app = express()
app.use(express.json())
app.use('/auth', router)

const start = async () => {
    try {
        app.listen(PORT, () => console.log("Server started at port", PORT));

        await connectDB();
    } catch (error) {
        console.log(error)        
    }
}

start();