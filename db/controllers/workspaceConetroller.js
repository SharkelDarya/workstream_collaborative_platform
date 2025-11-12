const User = require('../models/User')
const Workspace = require('../models/Workspace')
const WorkspaceMember = require('../models/WorkSpaceMember')
const Channel = require('../models/Channel')
require('dotenv').config();
const { Op } = require('sequelize');

class workspacehController {
    async addMembers(req, res) {
        try {
            // В будущем сделать проверку на админа либо владельца
            // const { id } = req.user
            const { id_workspace, name, role } = req.body
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
        try {
            const { id } = req.query;

            const workspace = await Workspace.findOne({ where: { id } });

            const memberships = await WorkspaceMember.findAll({
                where: { workspaceId: id },
                include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
            });

            const users = memberships.map(m => ({
                id: m.user?.id,
                name: m.user?.name,
                role: m.role
            }));

            const channels = await Channel.findAll({
                where: { workspaceId: id },
                attributes: ['id', 'name', 'isPrivate', 'createdAt']
            });

            res.json({ workspace, users, channels });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to load workspace info' });
        }
    }


    async getAllWorkspaces(req, res) {
        try {
            const { id } = req.user
            const ownedWorkspaces = await Workspace.findAll({ where: { ownerId: id } });
            const memberships = await WorkspaceMember.findAll({ where: { userId: id } });
            
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

    async deleteMember(req, res) {
        try {
            const { workspace_id } = req.query;
            const { id_user } = req.body;

            if (!workspace_id || !id_user) {
                return res.status(400).json({ message: "Workspace or user not define!" });
            }

            const member = await WorkspaceMember.findOne({
                where: {
                    workspaceId: workspace_id,
                    userId: id_user
                }
            });

            if (!member) {
                return res.status(404).json({ message: "User not exist in workspace!" });
            }

            await member.destroy();
            res.json({ message: "Done!" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed delete user!" });
        }
    }
}

module.exports = new workspacehController;