const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
    if(req.method === "OPTIONS"){
        next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1];
        if(!token) {
            return res.status(400).json({ messange: "User is not authorized!"})
        }

        const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = decodedData;
        next();

    } catch (error) {
        console.log(error)
        return res.status(400).json({ messange: "User is not authorized!"})
    }
}