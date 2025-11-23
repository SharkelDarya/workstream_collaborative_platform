const Message = require('./db/models/Message');
const User = require('./db/models/User');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New Connection!');

        socket.on('join channel', async ({ channel_id }) => {
            socket.join(`channel_${channel_id}`);
            console.log(`Joined channel ${channel_id}`);

            const messages = await Message.findAll({
                where: { channelId: channel_id },
                include: [{ model: User, as: 'user', attributes: ['id','name'] }],
                order: [['createdAt', 'ASC']]
            });

            socket.emit('channel history', messages);
        });

        socket.on('send message', async ({ channel_id, user_id, text }) => {
            if (!text) return;

            const message = await Message.create({
                channelId: channel_id,
                userId: user_id,
                text,
                metadata: {}
            });

            const messageData = {
                id: message.id,
                channelId: message.channelId,
                userId: message.userId,
                userName: (await User.findByPk(user_id)).name,
                text: message.text,
                metadata: message.metadata,
                createdAt: message.createdAt
            };

            io.to(`channel_${channel_id}`).emit('new message', messageData);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected!');
        });
    });
};
