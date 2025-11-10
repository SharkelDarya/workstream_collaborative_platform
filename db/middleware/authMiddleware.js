const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
    if(req.method === "OPTIONS"){
        next()
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "No token provided" });

        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token) return res.status(401).json({ message: "Invalid token" });

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        console.log(error)
        return res.status(400).json({ messange: "User is not authorized!"})
    }
}