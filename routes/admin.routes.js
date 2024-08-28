import express from 'express';
import { adminLogin, adminLogOut, allChats, allMessages, allUsers, getAdminData, getDashboardStats } from '../controllers/admin.controller.js';
import { adminLoginValidator, validate } from '../lib/validators.js';
import { onlyAdmin } from '../middlewares/auth.middleware.js';

const app = express.Router();

app.post("/verify", adminLoginValidator(), validate, adminLogin)

app.get("/logout", adminLogOut);

app.use(onlyAdmin)

app.get("/", getAdminData)

app.get("/users", allUsers)

app.get("/chats", allChats)

app.get("/messages", allMessages)

app.get("/stats", getDashboardStats)

export default app;