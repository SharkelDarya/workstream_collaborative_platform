const Router = require('express');
const authController = require('./controllers/authController');
const workspaceController = require('./controllers/workspaceConetroller');
const authMiddleware = require('./middleware/authMiddleware')

const router = new Router();

router.post('/registration', authController.registration);
router.post('/login', authController.login);
router.get('/user', authMiddleware, authController.getUser);
router.post('/create_workspace', authMiddleware, workspaceController.createWorkspace)
router.get('/workspaces', authMiddleware, workspaceController.getAllWorkspaces)
router.get('/workspace', authMiddleware, workspaceController.showWorkspace)
router.post('/add_members', authMiddleware, workspaceController.addMembers)
router.post('/delete_member', authMiddleware, workspaceController.deleteMember)

module.exports = router;