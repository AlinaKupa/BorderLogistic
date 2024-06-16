const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/getProfile', auth, userController.getProfile);
router.put('/changePassword', auth, userController.changePassword); 
router.put('/updateProfile', auth, userController.updateProfile);

module.exports = router;
