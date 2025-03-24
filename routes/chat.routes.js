import express from "express";
import Chat from "../models/Chat.model.js";

const chatRouter = express.Router();

/**
 * GET /api/chat return all chats
 */
chatRouter.get("/", async (req, res) => {
    try {
        const chats = await Chat.find();
        res.json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * GET /api/chat/:id return chat by the id
 */
chatRouter.get("/:id", async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);

        if (!chat) {
            return res.status(404).send("Chat not found");
        }

        res.json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * POST /api/chat create a new chat
 */
chatRouter.post("/", async (req, res) => {
    try {
        const newChat = new Chat(req.body);
        await newChat.save();
        res.status(201).json(newChat);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * DELETE /api/chat/:id delete a chat by the id
 */
chatRouter.delete("/:id", async (req, res) => {
    try {
        const deletedChat = await Chat.findByIdAndDelete(req.params.id);

        if (!deletedChat) {
            return res.status(404).send("Chat not found");
        }

        res.send("Chat deleted successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});


/**
 * PATCH /api/chat/:id update a chat the id
 */
chatRouter.patch("/:id", async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);

        if (!chat) {
            return res.status(404).send("Chat not found");
        }

        // update title of the chat
        if (req.body.title) {
            //...
            chat.title = req.body.title
        }

        // update messages of the chat
        if (req.body.messages) {
            chat.messages.push(...req.body.messages)
        }

        await chat.save();
        res.json(chat);


    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

export default chatRouter;