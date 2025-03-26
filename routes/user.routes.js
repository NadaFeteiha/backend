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
            .populate("roadmaps")
            .populate({
                path: 'progress',
                populate: {
                    path: 'roadmap',
                    select: 'title'
                }
            });

        if (!user) {
            return ResponseHandler.error(res, "User not found", 404);
        }

        const result = {
            id: user.id,
            name: user.name,
            email: user.email,
            userName: user.userName,
            role: user.role,
            profilePicture: user.profilePicture,
            roadmaps: user.roadmaps,
            progress: user.progress
        }

        ResponseHandler.success(res, result, 200);
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
        ).populate("roadmaps")
            .populate({
                path: 'progress',
                populate: {
                    path: 'roadmap',
                    select: 'title'
                }
            });

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
            roadmaps: newUserDetails.roadmaps,
            progress: newUserDetails.progress
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


export default userRouter;