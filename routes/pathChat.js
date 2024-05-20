// routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/history/:user1Id/:user2Id', chatController.getChatHistory);
router.get('/messages/:chatId', chatController.getChatMessages);
router.post('/messages', chatController.saveMessage); // Nueva ruta para guardar un mensaje

module.exports = router;