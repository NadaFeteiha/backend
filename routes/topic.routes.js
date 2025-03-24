import mongoose from "mongoose";
import { Router } from "express";
import { Topic } from "../models/Topic.model.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";

const topicRouter = new Router();

/**
 * @route GET /api/topic
 * @desc Get all topics or search by title
 */
topicRouter.get("/", async (req, res, next) => {
    try {
        const { title } = req.query;
        let query = Topic.find();

        if (title) {
            query = query.regex("title", new RegExp(title, "i"));
        }

        const topics = await query.exec();
        ResponseHandler.success(res, topics);
    } catch (err) {
        next(err);
    }
});

/**
 * @route GET /api/topic/:id
 * @desc Get a topic by id with all resources
 */
topicRouter.get("/:id", async (req, res, next) => {
    try {
        const topic = await Topic.findById(req.params.id).populate("resources");
        if (!topic) {
            return ResponseHandler.error(res, "Topic not found", 404);
        }

        ResponseHandler.success(res, topic);
    } catch (err) {
        next(err);
    }
});



/**
 * @route GET /api/topic/filter
 * @desc Get a topic by language or tags or type
 */
topicRouter.get("/filter", async (req, res, next) => {
    try {
        const { language, tags, type } = req.query;
        let query = Topic.find();

        if (language) {
            query = query.regex("language", new RegExp(language, "i"));
        }

        if (tags) {
            query = query.regex("tags", new RegExp(tags, "i"));
        }

        if (type) {
            query = query.regex("type", new RegExp(type, "i"));
        }

        const topics = await query.exec();
        ResponseHandler.success(res, topics);
    } catch (err) {
        next(err);
    }
});


/**
 * @route POST /api/topic
 * @desc Create a new topic
 */
topicRouter.post("/", async (req, res, next) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            ResponseHandler.error(res, "Title is required", 400);
        }

        let topic = new Topic({
            title,
            description
        });

        topic = await topic.save();
        ResponseHandler.success(res, topic);
    } catch (err) {
        next(err);
    }
});

/**
 * @route Patch /api/topic/:id
 * @desc update a topic by id
 */
topicRouter.patch("/:id", async (req, res, next) => {
    try {

        if (req.body.title === undefined && req.body.description === undefined) {
            ResponseHandler.error(res, "Title or description is required", 400);
        }

        if (req.body.title) {
            const isFound = await Topic.findOne({ title: req.body.title });
            if (isFound) {
                ResponseHandler.error(res, "Title already exists", 400);
            }
        }

        const topic = await Topic.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        )

        const data = {
            title: topic.title,
            description: topic.description,
            lastUpdated: topic.updatedAt,
        }
        ResponseHandler.success(res, data);
    } catch (err) {
        next(err);
    }
});


//TODO: admin or mentor only can delete a topic
/**
 * @route DELETE /api/topic/:id
 * @desc delete a topic by id
 */
topicRouter.delete("/:id", async (req, res, next) => {
    try {

        const topic = await Topic.findByIdAndDelete(req.params);
        if (!topic) {
            ResponseHandler.error(res, "Topic not found", 404);
        }

        ResponseHandler.success(res, null, "Topic deleted successfully");
    } catch (err) {
        next(err);
    }
});

export default topicRouter;