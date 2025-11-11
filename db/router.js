const Router = require('express');
const controller = require('./controller');
const authMiddleware = require('./middleware/authMiddleware')

const router = new Router();

router.post('/registration', controller.registration);
router.post('/login', controller.login);
router.get('/user', authMiddleware, controller.getUser);
router.post('/create_workspace', authMiddleware, controller.createWorkspace)
router.get('/workspaces', authMiddleware, controller.getWorkspace)
router.get('/show_workspace', authMiddleware, controller.showWorkspace)
router.post('/add_members', authMiddleware, controller.addMembers)

module.exports = router;