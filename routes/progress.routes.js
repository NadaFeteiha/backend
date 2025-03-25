import { Router } from "express";
import { Progress } from "../models/Progress.model.js";
import { Step } from "../models/Step.model.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";
import { User } from "../models/User.model.js";
import { Roadmap } from "../models/Roadmap.model.js";

const progressRouter = Router();

/**
 * @route GET /api/progress/:userId/progress
 * @desc Get all progress records for a user
 */
progressRouter.get("/:userId", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return ResponseHandler.error(res, "User not found", 404);
        }

        const progressRecords = await Progress.find({ user: req.params.userId })
            .populate({
                path: 'roadmap',
                select: 'title description'
            })
            .populate({
                path: 'currentStep',
                select: 'title order'
            });

        ResponseHandler.success(res, progressRecords);
    } catch (err) {
        next(err);
    }
});

/**
 * @route GET /api/progress/:userId/progress/:roadmapId
 * @desc Get user progress for specific roadmap
 */
progressRouter.get("/:userId/:roadmapId", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return ResponseHandler.error(res, "User not found", 404);
        }

        const progress = await Progress.findOne({
            user: req.params.userId,
            roadmap: req.params.roadmapId
        })
            .populate({
                path: 'roadmap',
                select: 'title description'
            })
            .populate({
                path: 'currentStep',
                select: 'title order',
                populate: {
                    path: 'topic',
                    select: 'title type'
                }
            })
            .populate({
                path: 'completedTopics.topic',
                select: 'title type',
                populate: {
                    path: 'topic',
                    select: 'title'
                }
            });

        if (!progress) {
            return ResponseHandler.error(res, "Progress not found", 404);
        }

        const enrichedProgress = await getEnrichedProgress(progress);
        ResponseHandler.success(res, enrichedProgress);
    } catch (err) {
        next(err);
    }
});

/**
 * @route POST /api/progress/:userId/progress/:roadmapId/start
 * @desc Add roadmap to user
 */
progressRouter.post("/:userId/:roadmapId/start", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return ResponseHandler.error(res, "User not found", 404);
        }

        const roadmap = await Roadmap.findById(req.params.roadmapId);
        if (!roadmap) {
            return ResponseHandler.error(res, "Roadmap not found", 404);
        }

        const existingProgress = await Progress.findOne({
            user: req.params.userId,
            roadmap: req.params.roadmapId
        });
        if (existingProgress) {
            return ResponseHandler.error(res, "Already tracking this roadmap", 400);
        }

        const firstStep = await Step.findOne({ roadmap: req.params.roadmapId }).sort({ order: 1 });

        const progress = new Progress({
            user: req.params.userId,
            roadmap: req.params.roadmapId,
            currentStep: firstStep?._id,
            progressPercentage: 0
        });

        await progress.save();

        // Add to user's progress 
        await User.findByIdAndUpdate(
            req.params.userId,
            { $addToSet: { progress: progress._id } }
        );

        const enrichedProgress = await getEnrichedProgress(progress);
        ResponseHandler.success(res, enrichedProgress, "Progress tracking started", 201);
    } catch (err) {
        next(err);
    }
});

/**
 * @route PATCH /api/users/:userId/progress/:roadmapId/complete-step
 * @desc Mark a step as completed
 */
progressRouter.patch("/:userId/:roadmapId/completeStep", async (req, res, next) => {
    try {
        const { stepId } = req.body;
        if (!stepId) return ResponseHandler.error(res, "stepId is required", 400);

        const progress = await Progress.findOne({
            user: req.params.userId,
            roadmap: req.params.roadmapId
        }).populate('currentStep');

        if (!progress) return ResponseHandler.error(res, "Progress not found", 404);

        const step = await Step.findById(stepId).populate('topic');
        if (!step) {
            return ResponseHandler.error(res, "Step not found", 404);
        }

        // Mark step as completed
        progress.completedSteps.push({
            step: stepId,
            completionPercentage: 100
        });

        // Mark topic as completed if not already
        const isTopicCompleted = progress.completedTopics.some(t => t.topic.equals(step.topic._id));
        if (!isTopicCompleted) {
            progress.completedTopics.push({
                topic: step.topic._id,
                resourcesCompleted: []
            });
        }

        // Find next step
        const nextStep = await Step.findOne({
            roadmap: req.params.roadmapId,
            order: { $gt: step.order }
        }).sort({ order: 1 });

        progress.currentStep = nextStep?._id || null;
        progress.lastActive = new Date();

        await progress.save();

        const enrichedProgress = await getEnrichedProgress(progress);
        ResponseHandler.success(res, enrichedProgress, "Step and topic marked as completed");
    } catch (err) {
        next(err);
    }
});

// ****** Helpers ******\\
const calculateProgress = async (roadmapId, completedStepsCount) => {
    const totalSteps = await Step.countDocuments({ roadmap: roadmapId });
    return totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;
};

const getEnrichedProgress = async (progress) => {
    const completedStepsCount = progress.completedSteps.length;
    const progressPercentage = await calculateProgress(progress.roadmap, completedStepsCount);

    return {
        ...progress.toObject(),
        progressPercentage,
        completedStepsCount,
        totalSteps: await Step.countDocuments({ roadmap: progress.roadmap })
    };
};



export default progressRouter;