import mongoose from "mongoose";
import { Router } from "express";
import { Topic } from "../models/Topic.model.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";

const topicRouter = new Router();

/**
 * @route GET /api/topic
 * @desc Get all topics or search by title
 * @query title,type,language
 */
topicRouter.get("/", async (req, res, next) => {
    try {
        const { title, type, language } = req.query;
        let query = {};

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }
        if (type) {
            query.type = type;
        }
        if (language) {
            query.language = { $regex: language, $options: 'i' };
        }

        const topics = await Topic.find(query)
            .populate("resources");

        ResponseHandler.success(res, topics);
    } catch (err) {
        next(err);
    }
});


//TODO: refactor to be depend on number of users are activly studying this topic
/**
 * @route GET /api/topic/popular
 * @desc Get num or 5 most popular topics
 */
topicRouter.get("/popular", async (req, res, next) => {
    try {
        const num = req.query.n || 5;
        const topics = await Topic.find().limit(num);

        const data = topics.map(topic => {
            return {
                id: topic.id,
                title: topic.title,
                description: topic.description,
            }
        });

        console.log("popular topics");
        console.log(data);
        ResponseHandler.success(res, data);
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
        const topic = await Topic.findById(req.params.id)
            .populate("resources");

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
 * @desc Get a topic by language or type
 */
topicRouter.get("/filter", async (req, res, next) => {
    try {
        const { language, type } = req.query;
        let query = Topic.find();

        if (language) {
            query = query.regex("language", new RegExp(language, "i"));
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
 * @body { title, description, type, language }
 */
topicRouter.post("/", async (req, res, next) => {
    try {
        const { title } = req.body;

        if (!title) {
            return ResponseHandler.error(res, "Title is required", 400);
        }

        const isFoundTopic = await Topic.findOne({ title });
        if (isFoundTopic) {
            return ResponseHandler.error(res, "Topic already exists", 409);
        }

        const topic = new Topic({
            title,
            description: req.body.description || "",
            type: req.body.type || "concept",
            language: req.body.language || "en"
        });

        const createdTopic = await topic.save();
        ResponseHandler.success(res, createdTopic);
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
            return ResponseHandler.error(res, "Topic not found", 404);
        }

        ResponseHandler.success(res, null, "Topic deleted successfully");
    } catch (err) {
        next(err);
    }
});

export default topicRouter;