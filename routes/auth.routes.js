import express from "express";
import { User } from "../models/User.model.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";

//TODO: Login using Github or Google
//TODO: JWT token and encrypt password
//TODO: Password reset

const authRouter = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Authenticate user sign in
 * @param {email, password}
 * 
 */
authRouter.post("/login", async (req, res, next) => {
    try {
        if (!req.body.email || !req.body.password) {
            return ResponseHandler.error(res, "email and password are required", 400);
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return ResponseHandler.error(res, "user not found", 404);
        }

        if (user.password !== req.body.password) {
            return ResponseHandler.error(res, "invalid password", 401);
        }

        const result = {
            id: user.id,
            email: user.email,
            userName: user.userName,
            name: user.name,
            profileUrl: user.profileUrl ? user.profileUrl : "",
        }
        ResponseHandler.success(res, result, "login successful", 200);
    } catch (error) {
        next(error);
    }
});


/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @param {email, password}
 */
authRouter.post("/register", async (req, res, next) => {
    try {
        if (!req.body.email || !req.body.password || !req.body.userName || !req.body.name) {
            return ResponseHandler.error(res, "email, password, username and name are required", 400);
        }

        const newUser = new User({
            email: req.body.email,
            password: req.body.password,
            userName: req.body.userName,
            name: req.body.name,
        });

        //check if user email or userName already exists
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return ResponseHandler.error(res, "email already exists");
        }

        const userName = await User.findOne({ userName: req.body.userName });
        if (userName) {
            return ResponseHandler.error(res, "userName already exists");
        }

        const dbUser = await newUser.save();

        const result = {
            id: dbUser.id,
            email: dbUser.email,
            userName: dbUser.userName,
            name: dbUser.name,
            profileUrl: dbUser.profileUrl ? dbUser.profileUrl : "",
        };

        ResponseHandler.success(res, result, "user created successfully", 201);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/auth/forgot-password
 * @desc Forgot password
 * @param {email}
 */
authRouter.get("/forgot-password", async (req, res, next) => {
    try {
        if (!req.body.email) {
            return ResponseHandler.error(res, "email is required");
        }

        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return ResponseHandler.error(res, "user not found", 404);
        }

        //TODO: send password reset link to email
        ResponseHandler.success(res, "password reset link sent to email");
    }
    catch (error) {
        next(error);
    }
});

//TODO: Reset password with token not Email
/**
 * @route PATCH /api/auth/reset-password
 * @desc Reset password
 * @param {email, password}
 */
authRouter.patch("/reset-password", async (req, res, next) => {
    try {
        if (!req.body.password || !req.body.email) {
            return ResponseHandler.error(res, "password and Email are required");
        }

        const user = await User.findOneAndUpdate(
            { email: req.body.email },
            { password: req.body.password });

        if (!user) {
            return ResponseHandler.error(res, "user not found", 404);
        }

        ResponseHandler.success(res, "password reset successful");
    } catch (error) {
        next(error);
    }
});

export default authRouter;