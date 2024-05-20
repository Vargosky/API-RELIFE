const Message = require('../model/Message');

// Obtener todos los chats entre dos usuarios
exports.getChatHistory = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los mensajes de un chat específico
exports.getMessagesByChatId = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enviar un mensaje en un chat específico (esta función no se utilizará directamente en las rutas, ya que los mensajes se manejan a través de Socket.IO)
exports.sendMessage = async (senderId, receiverId, content) => {
  try {
    const message = new Message({ senderId, receiverId, content });
    await message.save();
    return message;
  } catch (error) {
    throw error;
  }
};

exports.saveMessage = async (req, res) => {
  try {
    const { chatId, content, sender } = req.body;
    const newMessage = new Message({ chatId, content, sender });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};