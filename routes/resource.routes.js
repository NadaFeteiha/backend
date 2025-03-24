import mongoose from "mongoose";
import { Router } from "express";
import { Resource } from "../models/Resource.model.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";
import { Topic } from "../models/Topic.model.js";

const resourceRouter = new Router();

/**
 * @route GET /api/resource
 * @desc Get all resources or search by title
 */
resourceRouter.get("/", async (req, res, next) => {
    try {
        const { title } = req.query;
        let query = Resource.find();

        if (title) {
            query = query.regex("title", new RegExp(title, "i"));
        }

        const resources = await query.exec();
        ResponseHandler.success(res, resources);
    } catch (err) {
        next(err);
    }
});

/**
 * @route GET /api/resource/filter
 * @desc Get a resource by language or type
 */
resourceRouter.get("/filter", async (req, res, next) => {
    try {
        const { language, type } = req.query;
        let query = Resource.find();

        if (language) {
            query = query.regex("language", new RegExp(language, "i"));
        }

        if (type) {
            query = query.regex("type", new RegExp(type, "i"));
        }

        const resources = await query.exec();
        ResponseHandler.success(res, resources);
    } catch (err) {
        next(err);
    }
});


/**
 * @route POST /api/resource
 * @desc Create a new resource
 */
resourceRouter.post("/", async (req, res, next) => {
    try {
        const resource = new Resource(req.body);

        if (!resource.title || !resource.link || !resource.topicId) {
            return ResponseHandler.error(res, "Title, link and topicId are required");
        }

        const topic = await Topic.findById(resource.topicId);
        if (!topic) {
            return ResponseHandler.error(res, "Topic not found");
        }

        const createdResource = await resource.save();
        topic.resources.push(createdResource._id);
        await topic.save();

        ResponseHandler.success(res, createdResource, 201);
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