const bcrypt = require('bcrypt');
const User = require('./models/User')
const Workspace = require('./models/Workspace')
const WorkspaceMember = require('./models/WorkSpaceMember')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Op } = require('sequelize');

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
            // В будущем сделать проверку на админа либо владельца
            // const { id } = req.user
            const { id_workspace, name, role } = req.body
            console.log(id_workspace); 
            console.log(name); 
            console.log(role);
            const workspace = await Workspace.findOne({ where: { id: id_workspace }})
            if (!workspace) {
                return res.status(404).json({ message: "Workspace not found!" });
            }

            const user = await User.findOne({ where: { name: name } });
            if (!user) return res.status(404).json({ message: "User not found" });

            await WorkspaceMember.create({
                workspaceId: id_workspace,
                userId: user.id,
                role: role.toLowerCase()
            })

            res.json({ message: "Members added!" })

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

    async showWorkspace(req, res) {
        // const { id } = req.user
        const { id } = req.query

        const workspace = await Workspace.findOne({ where: { id: id } });
        res.json({workspace})
    }

    async getWorkspace(req, res) {
        try {
            const { id } = req.user
            const ownedWorkspaces = await Workspace.findAll({ where: { ownerId: id } });
            const memberships = await WorkspaceMember.findAll({ where: { userId: id } })
            
            const memberWorkspaceIds = memberships.map(memberships => memberships.workspaceId);

            const memberWorkspaces = await Workspace.findAll({
                where: {
                    id: memberWorkspaceIds,
                    ownerId: { [Op.ne]: id }   
                }
            });

            res.json({
            message: `Workspaces of user ${req.user.name}`,
            ownedWorkspaces,
            memberWorkspaces
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