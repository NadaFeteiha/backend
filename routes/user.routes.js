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

        ResponseHandler.success(res, user, 200);
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
        if (!req.body.profilePicture) {
            return ResponseHandler.error(res, "Profile picture is required");
        }

        const newUserDetails = await User.findByIdAndUpdate(
            req.params.id,
            { profilePicture: req.body.profilePicture },
            { new: true });

        if (!newUserDetails) {
            return ResponseHandler.error(res, "User not found", 404);
        }

        const result = {
            id: newUserDetails.id,
            name: newUserDetails.name,
            email: newUserDetails.email,
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