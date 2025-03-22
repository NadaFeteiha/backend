import { Router } from "express";
import { User } from "../models/user.model.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";

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
        const user = await User.findById(req.params.id);
        if (!user) {
            return ResponseHandler.error(res, "User not found", 404);
        }
        const result = {
            id: user.id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
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
        ResponseHandler.success(res, null, "User deleted", 200);
    } catch (err) {
        next(err);
    }
});

//TODO: Get users courses 
//TODO: Delete Roadmap from user account


export default userRouter;