import mongoose from "mongoose";
import { Router } from "express";
import { Resource } from "../models/Resource.model.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";
import { Topic } from "../models/Topic.model.js";

const resourceRouter = new Router();

/**
 * @route GET /api/resource
 * @desc Get all resources or search by title
 * @query title, language, type, topicId
 */
resourceRouter.get("/", async (req, res, next) => {
    try {
        const { title, language, type, topicId } = req.query;
        const query = {};

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }

        if (language) {
            query.language = language;
        }

        if (type) {
            query.type = type;
        }

        if (topicId) { query.topicId = topicId; }


        const resources = await Resource.find(query).exec();
        ResponseHandler.success(res, resources);
    } catch (err) {
        next(err);
    }
});

/**
 * @route GET /api/resources/search
 * @desc Search resources by title with autocomplete support
 * @query keyword
 */
resourceRouter.get("/search", async (req, res, next) => {
    try {
        const { keyword } = req.query;

        if (!keyword) {
            return ResponseHandler.error(res, "Need keyword to search", 400);
        }

        const resources = await Resource.find({ title: { $regex: q, $options: 'i' } });

        ResponseHandler.success(res, resources);
    } catch (err) {
        next(err);
    }
});

/**
 * @route POST /api/resources
 * @desc Create a new resource
 * @body  title, link, topicId
 */
resourceRouter.post("/", async (req, res, next) => {
    try {
        const { title, link, topicId } = req.body;

        if (!title || !link || !topicId) {
            return ResponseHandler.error(res, "title, link , topicId are required", 400);
        }

        // check if topic exists
        const topic = await Topic.findById(topicId);
        if (!topic) {
            return ResponseHandler.error(res, "Topic already exists", 404);
        }

        // check for duplicate resource
        const existingResource = await Resource.findOne({ link, topicId });
        if (existingResource) {
            return ResponseHandler.error(res, "Resource with this link already exists for the topic", 409);
        }

        const resource = new Resource({
            ...req.body,
            topicId
        });

        const createdResource = await resource.save();

        // Add resource to topic
        topic.resources.push(createdResource.id);
        await topic.save();

        const data = {
            id: createdResource.id,
            title: createdResource.title,
            link: createdResource.link,
            topic: topic.title,
            type: createdResource.type,
            language: createdResource.language
        };

        ResponseHandler.success(res, data);
    } catch (err) {
        next(err);
    }
});


/**
* @route Delete /api/resource/:id
* @desc delete a resource by id
**/
resourceRouter.delete("/:id", async (req, res, next) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);
        if (!resource) {
            return ResponseHandler.notFound(res, "Resource not found");
        }
        ResponseHandler.success(res, resource);
    } catch (err) {
        next(err);
    }
});


/**
 * @route Patch /api/resource/:id
 * @desc update a resource by id
 */
resourceRouter.patch("/:id", async (req, res, next) => {
    try {
        const resource = await Resource.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true });
        if (!resource) {
            return ResponseHandler.notFound(res, "Resource not found");
        }
        ResponseHandler.success(res, resource);
    } catch (err) {
        next(err);
    }
});

export default resourceRouter;