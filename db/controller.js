const bcrypt = require('bcrypt');
const User = require('./models/User')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (id) => {
    const payload = { id };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRES})
}

class Controller {
    async registration(req, res) {
        try {
            const {email, username, password} = req.body;
            const candidate = User.findOne({ name: username }, {email});
            if(!candidate){
                return res.status(400).json({ messange: "User not exists!" })
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const user = new User({email, name: username, passwordHash});
            await user.save();
            return res.json({ messange: "Done!", user: { id: user.id, email: user.email, name: user.name } })
        } catch (error) {
            console.log(error)
            res.status(400).json({messange: "Registration error!"})
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body
            const user = await User.findOne({ name: username})
            if(!user){
                return res.status(400).json({ messange: "User exists!" })
            }

            const validPassword = bcrypt.compareSync(password, user.passwordHash)
            if(!validPassword) {
                return res.status(400).json({ messange: "invalid password!" })
            }

            const token = generateAccessToken(user._id)
            return res.json({token})
        } catch (error) {
            console.log(error)
            res.status(400).json({messange: "Login error!"})
        }
    }

    async getUsers(req, res) {
        try {
            const users = await User.findAll()
            res.json(users)
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = new Controller;