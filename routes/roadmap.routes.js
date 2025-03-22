import mongoose from "mongoose";
import { Router } from "express";
import { Roadmap } from "../models/Roadmap.model.js";
import { User } from "../models/user.model.js";
import { Topic } from "../models/Topic.model.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";

const roadmapRouter = new Router();

/**
 * @route GET /api/roadmap
 * @desc Get all roadmaps
 *  or search roadmaps by title or category 
 */

roadmapRouter.get("/", async (req, res, next) => {
    try {

        const { title, category } = req.query;
        let query = Roadmap.find();

        if (title || category) {
            const conditions = [];

            if (title)
                conditions.push(query.regex("title", new RegExp(title, "i")));
            if (category)
                conditions.push(query.regex("category", new RegExp(category, "i")));

            query = query.or(conditions);
        }

        const roadmaps = await query.exec();
        ResponseHandler.success(res, roadmaps);
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
        const { title, description, category } = req.body;

        if (!title) {
            throw new Error("Title is required");
        }

        let roadmap = new Roadmap({
            title,
            description,
            category
        });

        roadmap = await roadmap.save();
        const newRoadmap = {
            title: roadmap.title,
            description: roadmap.description,
            category: roadmap.category,
            lastUpdated: roadmap.updatedAt,
        }
        ResponseHandler.success(res, newRoadmap);
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
        if (req.body.title === undefined && req.body.description === undefined && req.body.category === undefined) {
            ResponseHandler.error(res, "Title, description or category is required");
        }

        const roadmap = await Roadmap.findById(req.params.id);
        if (!roadmap) {
            ResponseHandler.error(res, "Roadmap not found", 404);
        }

        if (req.body.title) {
            const isFound = await Roadmap.findOne({ title: req.body.title });
            if (isFound) {
                ResponseHandler.error(res, "Title already exists");
            }
        }

        const updatedRoadmap = await Roadmap.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        )

        const data = {
            title: updatedRoadmap.title,
            description: updatedRoadmap.description,
            category: updatedRoadmap.category,
            lastUpdated: updatedRoadmap.updatedAt,
        }

        ResponseHandler.success(res, data);
    } catch (err) {
        next(err);
    }
});


//TODO: admin or mentor only can delete a roadmap
/**
 * @route DELETE /api/roadmap/:id
 * @desc delete a roadmap by id
 */
roadmapRouter.delete("/:id", async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findByIdAndDelete(req.params.id);
        if (!roadmap) {
            ResponseHandler.error(res, "Roadmap not found", 404);
        }
        ResponseHandler.success(res, "Roadmap deleted successfully");
    } catch (err) {
        next(err);
    }
});

export default roadmapRouter;