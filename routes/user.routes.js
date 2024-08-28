import express from "express";
import { acceptFriendRequest, getAllNotifications, getMyFriends, getMyProfile, login, logout, newUser, searchUser, sendFriendRequest } from "../controllers/user.controllers.js";
import {  singleAvatar } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import  {acceptRequestValidator, loginValidator, registerValidator, sendRequestValidator, validate}  from "../lib/validators.js";

const app = express.Router();

app.post("/new" , singleAvatar, registerValidator(), validate, newUser)
app.post("/login", loginValidator(), validate, login);

app.use(isAuthenticated);

app.get("/me", getMyProfile)
app.get("/logout", logout);
app.get("/search", searchUser);


app.put("/sendrequest", sendRequestValidator(), validate, sendFriendRequest);
app.put("/acceptrequest",acceptRequestValidator(), validate, acceptFriendRequest);
app.get("/notifications", getAllNotifications);
app.get("/friends", getMyFriends);


export default app; 
