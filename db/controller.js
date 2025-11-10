const bcrypt = require('bcrypt');
const User = require('./models/User')
const Workspace = require('./models/Workspace')
const WorkspaceMember = require('./models/WorkSpaceMember')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (id, name) => {
    const payload = { id, name};
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

            const token = generateAccessToken(user.id, user.name)
            return res.json({ messange: "Done!", user: { id: user.id, email: user.email, name: user.name }, token })
        } catch (error) {
            console.log(error)
            res.status(400).json({messange: "Login error!"})
        }
    }

    async createWorkspace(req, res) {
        try {
            const { id } = req.user
            const { name_workspace }  = req.body
            const workspace = new Workspace({
                name: name_workspace,
                ownerId: id
            })

            await workspace.save();

            res.json({messange: "Workspace created! ", workspace})
        } catch (error) {
            console.log(error)
            res.status(400).json({messange: "Cannt create new Workspace!"})
        }
    }

    async getWorkspace(req, res) {
        try {
            const { id } = req.user
            const workspaces = await Workspace.findAll({ where: { ownerId: id } });
            res.json({
            message: `Workspaces of user ${req.user.name}`,
            workspaces
        });
        } catch (error) {
            console.log(error)
            res.status(400).json({messange: "Cannt show Workspace!"})
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