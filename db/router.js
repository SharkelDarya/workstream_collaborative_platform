const Router = require('express');
const authController = require('./controllers/authController');
const workspaceController = require('./controllers/workspaceController');
const channelController = require('./controllers/channelController');
const authMiddleware = require('./middleware/authMiddleware')

const router = new Router();

//Auth
router.post('/registration', authController.registration);
router.post('/login', authController.login);
router.get('/user', authMiddleware, authController.getUser);

//Workspace
router.post('/create_workspace', authMiddleware, workspaceController.createWorkspace)
router.get('/workspaces', authMiddleware, workspaceController.getAllWorkspaces)
router.get('/workspace', authMiddleware, workspaceController.getWorkspace)
router.post('/add_members', authMiddleware, workspaceController.addMembers)
router.post('/delete_member', authMiddleware, workspaceController.deleteMember)
router.post('/add_job', authMiddleware, workspaceController.createJob)
router.post('/get_jobs', authMiddleware, workspaceController.getJobs)
router.post('/delete_job', authMiddleware, workspaceController.deleteJob)

//Channel
router.post('/add_channel', authMiddleware, channelController.add)
router.post('/delete_channel', authMiddleware, channelController.delete)
router.get('/channel', authMiddleware, channelController.get_channel_data)

module.exports = router;