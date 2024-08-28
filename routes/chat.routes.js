import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { addMembers, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, leaveGroup, newGorupChat, removeMember, renameGroup, sendAttachment } from "../controllers/chat.controller.js";
import { attachmetsMulter } from "../middlewares/multer.js";
import { addMemberValidator, chatValidator, leaveGroupValidator, newGroupValidator, removeMemberValidator, renameValidator, sendAttachmentsValidator, validate } from "../lib/validators.js";

const app = express.Router();

app.use(isAuthenticated);

app.post("/new" , newGroupValidator(), validate, newGorupChat);

app.get("/my", getMyChats);

app.get("/my/groups", getMyGroups); 

app.put("/addmembers",addMemberValidator(), validate, addMembers);

app.put("/removemember", removeMemberValidator(), validate, removeMember);

app.delete("/leave/:id", leaveGroupValidator(), validate, leaveGroup);

app.post("/message", attachmetsMulter,sendAttachmentsValidator(), validate, sendAttachment);  


app.get("/messages/:id", chatValidator(), validate, getMessages);

app.route("/:id")
.get(chatValidator(), validate, getChatDetails)
.put(renameValidator(), validate, renameGroup)
.delete(chatValidator(), validate, deleteChat);

export default app; 
