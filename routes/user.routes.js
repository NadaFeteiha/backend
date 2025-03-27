import { Router } from "express";
import { ResponseHandler } from "../utils/ResponseHandler.js";
import { User } from "../models/User.model.js";
import { Roadmap } from "../models/Roadmap.model.js";
import { Progress } from "../models/Progress.model.js";
import { Step } from "../models/Step.model.js";

/**
    this rout to get user details
    the roadmap is to get user details from the database
    change his profile details
    delete his account 
 */

const userRouter = new Router();

// TODO: get user profile by token
/**
 * @route GET /api/user/profile
 * @desc Get user profile
 */

userRouter.get("/profile/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .populate({
                path: 'progress',
                populate: [
                    {
                        path: 'roadmap',
                    },
                    {
                        path: 'completedSteps.step',
                        select: 'title order topic',

                    },
                    {
                        path: 'currentStep',
                        select: 'title order topic',
                    }
                ]
            });

        if (!user) {
            return ResponseHandler.error(res, "User not found", 404);
        }

        const roadmaps = user.progress.map((progress) => {
            const totalSteps = progress.roadmap.steps.length;
            const completedCount = progress.completedSteps.length;
            return {
                id: progress.roadmap._id,
                title: progress.roadmap.title,
                description: progress.roadmap.description,
                currentStep: progress.currentStep ? {
                    id: progress.currentStep._id,
                    title: progress.currentStep.title,
                    order: progress.currentStep.order,
                } : null,
                completedSteps: progress.completedSteps.map((step) => ({
                    id: step.step._id,
                    title: step.step.title,
                    order: step.step.order,
                })),
                totalSteps: totalSteps,
                completedCount: completedCount,
                startedAt: progress.startedAt,
                lastActive: progress.lastActive
            };
        });

        console.log("========= >user here");
        const test = await User.findById(req.params.id).populate("roadmaps");
        const test2 = test.roadmaps;
        const otherRoadmaps = test2.filter((roadmap) => {
            return !user.progress.some((progress) => progress.roadmap._id.equals(roadmap._id));
        }).map((roadmap) => {
            return {
                id: roadmap._id,
                title: roadmap.title,
                description: roadmap.description,
                currentStep: null,
                completedSteps: [],
                totalSteps: 0,
                completedCount: 0,
                startedAt: null,
                lastActive: null
            }
        });
        console.log("========= >end other roadmaps");
        const final = roadmaps.concat(otherRoadmaps);
        console.log(final);
        console.log("========= >user roadmaps");


        const result = {
            id: user._id,
            name: user.name,
            email: user.email,
            userName: user.userName,
            role: user.role,
            profilePicture: user.profilePicture || null,
            roadmaps: final,
        };

        ResponseHandler.success(res, result, "User profile retrieved successfully", 200);
    } catch (err) {
        next(err);
    }
});


/**
 * @route Patch /api/user/profile
 * @desc Update user profile picture
 */
userRouter.patch("/profile/:id", async (req, res, next) => {
    try {
        const { profilePicture, name } = req.body;
        console.log("backend user profile update");
        console.log(req.body);
        if (!profilePicture && !name) {
            return ResponseHandler.error(res, "Profile picture or name is required");
        }

        const updateData = {};
        if (profilePicture) {
            updateData.profilePicture = profilePicture;
        }
        if (name) {
            updateData.name = name;
        }

        const newUserDetails = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!newUserDetails) {
            return ResponseHandler.error(res, "User not found", 404);
        }

        const result = {
            id: newUserDetails.id,
            name: newUserDetails.name,
            email: newUserDetails.email,
            userName: newUserDetails.userName,
            role: newUserDetails.role,
            profilePicture: newUserDetails.profilePicture,
        }
        ResponseHandler.success(res, result);
    } catch (err) {
        next(err);
    }
});


//TODO: delete roadmap and progress of user too later!
/**
 * @route DELETE /api/user/delete
 * @desc Delete user account
 */
userRouter.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return ResponseHandler.error(res, "User not found", 404);
        }
        ResponseHandler.success(res, null, "User deleted");
    } catch (err) {
        next(err);
    }
});


userRouter.delete("/:id/roadmap/:roadmapId", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return ResponseHandler.error(res, "User not found");
        }

        const roadmap = await Roadmap.findById(req.params.roadmapId);
        if (!roadmap) {
            return ResponseHandler.error(res, "Roadmap not found");
        }

        const index = user.roadmaps.indexOf(req.params.roadmapId);
        if (index === -1) {
            return ResponseHandler.error(res, "User not in this roadmap");
        }

        user.roadmaps.splice(index, 1);
        await user.save();

        const data = {
            roadmaps: user.roadmaps,
            success: true
        }

        ResponseHandler.success(res, data, "User removed from roadmap successfully");
    } catch (err) {
        next(err);
    }
});

/**
 * @route GET /api/user/:id/roadmaps
 * @desc Get all roadmaps for a user
 */
userRouter.get("/:id/roadmaps", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .populate({
                path: 'roadmaps',
                select: 'title description createdAt'
            });

        if (!user) {
            return ResponseHandler.error(res, "User not found", 404);
        }

        ResponseHandler.success(res, user.roadmaps);
    } catch (err) {
        next(err);
    }
});


/**
 * @route GET /api/user/:id/roadmap/:roadmapId
 * @desc Check if user is in a roadmap
 */
userRouter.get("/:id/roadmap/:roadmapId", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return ResponseHandler.error(res, "User not found");
        }

        const roadmap = await Roadmap.findById(req.params.roadmapId);
        if (!roadmap) {
            return ResponseHandler.error(res, "Roadmap not found");
        }

        const inRoadmap = user.roadmaps.includes(req.params.roadmapId);
        ResponseHandler.success(res, { inRoadmap });
    } catch (err) {
        next(err);
    }
});


/**
 * @route POST /api/user/:id/roadmap/:roadmapId
 * @desc Add user to a roadmap
 */
userRouter.post("/:id/roadmap/:roadmapId", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return ResponseHandler.error(res, "User not found");
        }

        const roadmap = await Roadmap.findById(req.params.roadmapId);
        if (!roadmap) {
            return ResponseHandler.error(res, "Roadmap not found");
        }

        user.roadmaps.push(req.params.roadmapId);
        await user.save();

        const progress = new Progress({
            user: user.id,
            roadmap: roadmap.id,
            startedAt: new Date(),
            lastActive: new Date(),
        });
        await progress.save();

        const data = {
            roadmaps: user.roadmaps,
            success: true
        }

        ResponseHandler.success(res, data, "User added to roadmap successfully");
    } catch (err) {
        next(err);
    }
});


export default userRouter;