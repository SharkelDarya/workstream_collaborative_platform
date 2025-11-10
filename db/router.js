const Router = require('express');
const controller = require('./controller');
const authMiddleware = require('./middleware/authMiddleware')

const router = new Router();

router.post('/registration', controller.registration);
router.post('/login', controller.login);
router.get('/users', authMiddleware, controller.getUsers);
router.post('/create_workspace', authMiddleware, controller.createWorkspace)
router.get('/workspaces', authMiddleware, controller.getWorkspace)
router.post('/add_members', authMiddleware, controller.addMembers)

module.exports = router;