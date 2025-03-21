import { Router } from "express";
import { User } from "../models/user.model.js";

export const userRouter = new Router();

userRouter.get("/", (req, res) => {
    res.json({ message: "Hello from user route" });
});


export default userRouter;