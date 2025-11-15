const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Channel = require('../models/Channel');
const Message = require('../models/Message');
require('dotenv').config();

class channelController {
    async add(req, res) {
        try {
            const { workspace_id, name, isPrivate } = req.body;

            const workspace = await Workspace.findOne({ where: { id: workspace_id } });
            if(!workspace){
                return res.status(404).json({ message: "Workspace not found!" });
            }

            await Channel.create({
                workspaceId: workspace_id,
                name,
                isPrivate
            })

            res.json({ message: "Channel added successfully"});
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed add channel!" });
        }
    }

    async delete(req, res) {
        try {
            const { workspace_id, channel_id} = req.body;

            const workspace = await Workspace.findOne({ where: { id: workspace_id } });
            if(!workspace){
                return res.status(404).json({ message: "Workspace not found!" });
            }

            const channel = await Channel.findOne({
                where: { id: Number(channel_id), workspaceId: Number(workspace_id) }
            });
            if(!channel){
                return res.status(404).json({ message: "Channel not found!" });
            }

            await channel.destroy();
            res.json({ message: "Done!" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed delete channel!" });
        }
    }

    async getAllMessange(req, res) {
        try {
            const { workspace_id, channel_id} = req.body;
            const workspace = await Workspace.findOne({ where: { id: workspace_id } });
            if(!workspace){
                return res.status(404).json({ message: "Workspace not found!" });
            }

            const channel = await Channel.findOne({
                where: { id: Number(channel_id), workspaceId: Number(workspace_id) }
            });
            if(!channel){
                return res.status(404).json({ message: "Channel not found!" });
            }    

            const messages = await Message.findAll({
                where: { channelId: channel_id },
                include: [{ model: User, as: 'user', attributes: ['id','name'] }],
                order: [['createdAt', 'ASC']]
            });

            res.json({ messages });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to get messanges!" });
        }
    }

    async get_channel_data(req, res) {
        try {
            const channel_id = req.query.id;
            const channel = await Channel.findOne({
                where: { id: Number(channel_id) }
            });
            if(!channel){
                return res.status(404).json({ message: "Channel not found!" });
            }
            res.json( {channel} )
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to get channel data!" });
        }
        
    }
}

module.exports = new channelController;