const bcrypt = require('bcrypt');
const User = require('./models/User')
const Workspace = require('./models/Workspace')
const WorkspaceMember = require('./models/WorkSpaceMember')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (id, name, email) => {
    const payload = { id, name, email};
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRES})
}

class Controller {
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

    async addMembers(req, res) {
        try {
            const { id } = req.user
            const { id_workspace, ids_members, roles } = req.body
            
            const workspace = await Workspace.findOne({ where: { id: id_workspace }})
            if (!workspace) {
                return res.status(404).json({ message: "Workspace not found!" });
            }

            const roleMap = {
                0: 'member',
                1: 'admin'
            };

            const addedMembers = [];
            for(let i = 0; i < ids_members.length; i++){
                const userId = ids_members[i];
                const roleNumber = roles[i];

                let role = 'member'
                if(roleNumber == 1) role = 'admin';

                const member = await WorkspaceMember.create({
                    workspaceId: id_workspace,
                    userId,
                    role
                })

                addedMembers.push(member);
            }

            res.json({ message: "Members added!", members: addedMembers })

        } catch (error) {
            console.log(error)
            res.status(400).json({messange: "Cannt add members to Workspace!"})
        }
    }

    async createWorkspace(req, res) {
        try {
            const { id } = req.user
            const { name_workspace }  = req.body
            
            const workspace = await Workspace.create({
                name: name_workspace,
                ownerId: id
            });

            const workspaceMember = await WorkspaceMember.create({
                workspaceId: workspace.id,
                userId: id,
                role: 'owner'
            });

            res.json({
                message: "Workspace created!",
                workspace,
                workspaceMember
            });
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

module.exports = new Controller;