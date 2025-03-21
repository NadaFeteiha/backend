import express from "express";
import { User } from "../models/user.model.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";

// const ResponseHandler = require("../utils/ResponseHandler.js");
const authRouter = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Authenticate user sign in
 * @param {email, password}
 * 
 */
authRouter.post("/login", async (req, res) => {

    if (!req.body.email || !req.body.password) {
        ResponseHandler.error(res, "email and password are required", 400);
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return ResponseHandler.error(res, "user not found", 404);
    }

    if (user.password !== req.body.password) {
        return ResponseHandler.error(res, "invalid password", 401);
    }

    const result = user.map((user) => {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            profileUrl: user.profileUrl,
            //TODO: generate token
        };
    });
    ResponseHandler.success(res, result, "login successful", 200);
});


/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @param {email, password}
 */
authRouter.post("/register", async (req, res) => {
    const newUser = new User({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        name: req.body.name,
    });

    //check if user email or username already exists
    const user = await User.findOne({ email: req.body.email });
    if (user) {
        ResponseHandler.error(res, "email already exists", 400);
    }

    const username = await User.findOne({ username: req.body.username });
    if (username) {
        ResponseHandler.error(res, "username already exists", 400);
    }

    const dbUser = await newUser.save();
    const result = dbUser.map((user) => {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            profileUrl: user.profileUrl,
        };
    })

    ResponseHandler.success(res, result, "user created successfully", 201);
});

/**
 * @route GET /api/auth/forgot-password
 * @desc Forgot password
 * @param {email}
 */
authRouter.get("/forgot-password", async (req, res) => {
    if (!req.body.email) {
        return res.status(400).send("email is required");
    }

    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(404).send("user not found");
    }

    //TODO: send password reset link to email
    res.status(200).send({
        status: true,
        message: "password reset link sent to email",
    });
});


export default authRouter;