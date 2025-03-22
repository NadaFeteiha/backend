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

/**
 * @route GET /api/user/profile
 * @desc Get user profile
 */
// TODO: get user profile by token
userRouter.get("/profile/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return ResponseHandler.error(res, "User not found", 404);
    }
    ResponseHandler.success(res, user, "User details", 200);
});


/**
 * @route Patch /api/user/profile
 * @desc Update user profile picture
 */
userRouter.patch("/profile/:id", async (req, res) => {

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

    const result = newUserDetails.map((user) => {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
        }
    });

    ResponseHandler.success(res, result, "Profile picture updated");
});

/**
 * @route DELETE /api/user/delete
 * @desc Delete user account
 */
userRouter.delete("/delete/:id", async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return ResponseHandler.error(res, "User not found", 404);
    }
    ResponseHandler.success(res, null, "User deleted", 200);
});

//TODO: Get users courses 
//TODO: Delete Roadmap from user account


export default userRouter;