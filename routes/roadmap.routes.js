import mongoose from "mongoose";
import { Router } from "express";
import { Roadmap } from "../models/Roadmap.model.js";
import { Topic } from "../models/Topic.model.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";
import { Step } from "../models/Step.model.js";

const roadmapRouter = new Router();

roadmapRouter.get("/simple", async (req, res, next) => {
    try {

        const roadmaps = await Roadmap.find();
        const data = roadmaps.map(roadmap => {
            return {
                id: roadmap.id,
                title: roadmap.title,
                description: roadmap.description,
            }
        });

        ResponseHandler.success(res, data);
    } catch (err) {
        next(err);
    }
});

/**
 * @route GET /api/roadmap
 * @desc Get all roadmaps
 *  or search roadmaps by title  
 */
roadmapRouter.get("/", async (req, res, next) => {
    try {
        const { title } = req.query;
        let query = {};

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }


        const roadmaps = await Roadmap.find(query);

        const data = roadmaps.map(roadmap => {
            return {
                id: roadmap.id,
                title: roadmap.title,
                description: roadmap.description,
                lastUpdated: roadmap.updatedAt,
            }
        });

        ResponseHandler.success(res, data);
    } catch (err) {
        next(err);
    }
});

/**
 * @route GET /api/roadmaps/:id
 * @desc Get roadmap by id with topics
 */
roadmapRouter.get("/:id", async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id)
            .populate({
                path: 'steps',
                populate: {
                    path: 'topic',
                    select: 'title description type resources'
                },
                options: { sort: { order: 1 } }
            });

        if (!roadmap) {
            return ResponseHandler.error(res, "Roadmap not found", 404);
        }

        const data = {
            roadmap: {
                id: roadmap.id,
                title: roadmap.title,
                description: roadmap.description,
                lastUpdated: roadmap.updatedAt,
                totalSteps: roadmap.steps.length,
                totalTopics: roadmap.topics.length
            },
            steps: roadmap.steps.map(step => ({
                id: step._id,
                title: step.title,
                order: step.order,
                topic: {
                    id: step.topic._id,
                    title: step.topic.title,
                    description: step.topic.description,
                    type: step.topic.type,
                }
            }))
        };

        ResponseHandler.success(res, data);
    } catch (err) {
        next(err);
    }
});


//TODO: admin or mentor only can create a roadmap
/**
 * @route POST /api/roadmap
 * @desc Create a new roadmap
 */
roadmapRouter.post("/", async (req, res, next) => {
    try {
        const { title } = req.body;

        if (!title) {
            return ResponseHandler.error(res, "Title is required", 400);
        }

        const isExistRoadmap = await Roadmap.findOne({ title });
        if (isExistRoadmap) {
            return ResponseHandler.error(res, "Roadmap with this title already exists", 409);
        }

        const roadmap = new Roadmap({
            title,
            description: req.body.description || "",
            topics: req.body.topics || [],
            steps: req.body.steps || []
        });

        const createdRoadmap = await roadmap.save();

        const data = {
            id: createdRoadmap.id,
            title: createdRoadmap.title,
            description: createdRoadmap.description,
            lastUpdated: createdRoadmap.updatedAt,
            topics: createdRoadmap.topics,
        }

        ResponseHandler.success(res, data);
    } catch (err) {
        next(err);
    }
});


/**
 * @route Patch /api/roadmap/:id
 * @desc update a roadmap by id
 */
roadmapRouter.patch("/:id", async (req, res, next) => {
    try {
        if (req.body.title === undefined && req.body.description === undefined) {
            return ResponseHandler.error(res, "Title, description is required");
        }

        const roadmap = await Roadmap.findById(req.params.id);
        if (!roadmap) {
            return ResponseHandler.error(res, "Roadmap not found", 404);
        }

        if (req.body.title) {
            const isFound = await Roadmap.findOne({ title: req.body.title });
            if (isFound) {
                return ResponseHandler.error(res, "Title already exists");
            }
        }

        const updatedRoadmap = await Roadmap.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        )

        const data = {
            title: updatedRoadmap.title,
            description: updatedRoadmap.description,
            lastUpdated: updatedRoadmap.updatedAt,
        }

        ResponseHandler.success(res, data);
    } catch (err) {
        next(err);
    }
});


//TODO: admin or mentor only can delete a roadmap
//TODO: delete all topics and steps related to this roadmap
/**
 * @route DELETE /api/roadmap/:id
 * @desc delete a roadmap by id
 */
roadmapRouter.delete("/:id", async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findByIdAndDelete(req.params.id);
        if (!roadmap) {
            return ResponseHandler.error(res, "Roadmap not found", 404);
        }
        ResponseHandler.success(res, "Roadmap deleted successfully");
    } catch (err) {
        next(err);
    }
});

/**
 * @route POST /api/roadmap/:id/topic
 * @desc Add a topic to a roadmap
 */
roadmapRouter.post("/:id/topic", async (req, res, next) => {
    try {
        const { topicId } = req.body;

        if (!topicId) {
            return ResponseHandler.error(res, "Topic id is required");
        }

        const topic = await Topic.findById(topicId);
        if (!topic) {
            return ResponseHandler.error(res, "Topic not found", 404);
        }

        const roadmap = await Roadmap.findByIdAndUpdate(
            req.params.id,
            { $push: { topics: topicId } },
            { new: true }
        ).populate("topics");

        if (!roadmap) {
            return ResponseHandler.error(res, "Roadmap not found", 404);
        }

        const data = {
            id: roadmap.id,
            title: roadmap.title,
            description: roadmap.description,
            topics: roadmap.topics.map(topic => {
                return {
                    id: topic.id,
                    title: topic.title,
                    description: topic.description,
                }
            }),
            lastUpdated: roadmap.updatedAt,
        }

        ResponseHandler.success(res, data);
    } catch (err) {
        next(err);
    }
});


/**
 * @route GET /api/roadmaps/:id/steps
 * @desc Get all steps for a roadmap
 */
roadmapRouter.get("/:id/steps", async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id);
        if (!roadmap) {
            return ResponseHandler.error(res, "Roadmap not found", 404);
        }

        const steps = await Step.find({ roadmap: req.params.id })
            .sort({ order: 1 })
            .populate("topic");

        const data = steps.map(step => {
            return {
                id: step.id,
                title: step.title,
                order: step.order,
                topic: {
                    id: step.topic.id,
                    title: step.topic.title,
                    description: step.topic.description,
                }
            }
        });
        ResponseHandler.success(res, data);
    } catch (err) {
        next(err);
    }
});


/**
 * @route POST /api/roadmaps/:id/steps
 * @desc add step for a roadmap
 */
roadmapRouter.post("/:id/steps", async (req, res, next) => {
    try {
        const { title, order, topicId } = req.body;

        if (!title || order === undefined || !topicId) {
            return ResponseHandler.error(res, "Title and order are required", 400);
        }

        const topic = await Topic.findById(topicId);
        if (!topic) {
            return ResponseHandler.error(res, "Topic not found", 404);
        }

        const roadmap = await Roadmap.findById(req.params.id);
        if (!roadmap) {
            return ResponseHandler.error(res, "Roadmap not found", 404);
        }

        const step = new Step({
            title,
            order,
            roadmap: req.params.id,
            topic: topicId
        });

        const savedStep = await step.save();

        // Add step to roadmap's steps array
        const updatedRoadmap = await Roadmap.findByIdAndUpdate(
            req.params.id,
            { $push: { steps: savedStep._id } },
            { new: true }
        ).populate("steps");


        const data = {
            roadmap: {
                id: updatedRoadmap.id,
                title: updatedRoadmap.title,
                description: updatedRoadmap.description,
                lastUpdated: updatedRoadmap.updatedAt,
            },
            step: {
                id: savedStep.id,
                title: savedStep.title,
                order: savedStep.order,
                topic: {
                    id: topic.id,
                    title: topic.title,
                    description: topic.description,
                }
            }
        }

        ResponseHandler.success(res, data, "Step created successfully", 201);
    } catch (err) {
        next(err);
    }
});

export default roadmapRouter;