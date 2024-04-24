const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/', userController.addUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
