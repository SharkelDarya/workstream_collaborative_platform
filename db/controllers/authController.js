const bcrypt = require('bcrypt');
const User = require('../models/User')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (id, name, email) => {
    const payload = { id, name, email};
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRES})
}

class authController {
    async registration(req, res) {
        try {
            const { email, username, password } = req.body;

            const candidate = await User.findOne({ where: { name: username}});
            if(candidate){
                return res.status(400).json({ message: "User already exists!" });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const user = new User({ email, name: username, passwordHash });
            await user.save();

            res.redirect('/index.html');
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "Registration error!" });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body
            const user = await User.findOne({ where: { name: username}})
            if(!user){
                return res.status(400).json({ message: "User does not exist!" })
            }

            const validPassword = bcrypt.compareSync(password, user.passwordHash)
            if(!validPassword) {
                return res.status(400).json({ messange: "invalid password!" })
            }

            const token = generateAccessToken(user.id, user.name, user.email)

            return res.json({
                message: "Login successful",
                user: { id: user.id, name: user.name, email: user.email },
                token
            });
        } catch (error) {
            console.log(error)
            res.status(400).json({messange: "Login error!"})
        }
    }

    async getUser(req, res) {
        try {
            res.json({
                id: req.user.id,
                name: req.user.name,
                email: req.user.email
            });
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = new authController;