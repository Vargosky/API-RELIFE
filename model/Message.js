const { Schema, model } = require("mongoose");

const messageSchema = Schema({

    senderId: {
        type: String,
        ref: 'User',
        required: true,
    },
    receiverId: {
        type: String,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});


module.exports = model("Message", messageSchema, "messageSchema");