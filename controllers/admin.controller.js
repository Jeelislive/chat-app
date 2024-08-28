import { TryCatch } from "../middlewares/error.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js"
import  jwt from "jsonwebtoken";
import  {cookieOptions} from "../utils/features.js"

const adminLogin = TryCatch(async (req, res) => {
    const {secretKey} = req.body;

    const adminSecretKey = process.env.ADMIN_SECRET_KEY || "admin123";
    const  isMatch = secretKey === adminSecretKey;

    if(!isMatch) return res.status(401).json({
            status: false,
            message: "Invalid secret key"
        });

    const token = jwt.sign(secretKey, process.env.JWT_SECRET);

    return res.status(200).cookie("adminchatapptoken", token,
         {
         ...cookieOptions,
         maxAge: 15 * 60 * 1000,
        }).json({
            success: true,
            message: "Admin logged in successfully. Welcome BOSS"
        });
});

const allUsers = TryCatch(async (req, res) => {
    const users = await User.find({})   

    const tranaformedUsers = await Promise.all(
        users.map( async({name, username, avatar, _id}) => {

            const [groups, friends] = await Promise.all(
                [Chat.countDocuments({groupChat: true,members:_id}),
                Chat.countDocuments({groupChat: false,members:_id})
                ],
            )
    
            return {
                name, 
                username,
                avatar: avatar.url,
                _id,
                groups,
                friends
            }
        }
    )


)

    res.status(200).json({
        status: true,
        users: tranaformedUsers
    });
});

const getAdminData = TryCatch(async (req, res, next) => {
   return res.status(200).json({
      admin: true,
   });
});


const allChats = TryCatch(async (req, res) => {
    const chats = await Chat.find({})
      .populate("members", "name avatar")
      .populate("creator", "name avatar");
  
    const transformedChats = await Promise.all(
      chats.map(async ({ members, _id, groupChat, name, creator }) => {
        const totalMessages = await Message.countDocuments({ chat: _id });
  
        return {
          _id,
          groupChat,
          name,
          avatar: members.slice(0, 3).map((member) => member.avatar.url),
          members: members.map(({ _id, name, avatar }) => ({
            _id,
            name,
            avatar: avatar.url,
          })),
          creator: {
            name: creator?.name || "None",
            avatar: creator?.avatar.url || "",
          },
          totalMembers: members.length,
          totalMessages,
        };
      })
    );
  
    return res.status(200).json({
      status: "success",
      chats: transformedChats,
    });
  });
  
const allMessages = TryCatch(async (req, res) => {
    const messages = await Message.find({})
      .populate("sender", "name avatar")
      .populate("chat", "groupChat");
  
      const transformedMessages = messages.map(
        ({ content, attachments, _id, sender, createdAt, chat }) => ({
          _id,
          attachments,
          content,
          createdAt,
          chat: chat?._id,
          groupChat: chat.groupChat,
          sender: {
            _id: sender?._id,
            name: sender?.name,
            avatar: sender?.avatar.url,
          },
        })
      );
  
    return res.status(200).json({
      success: true,
      messages: transformedMessages,
    });
  });

const getDashboardStats = TryCatch(async (req, res) => {
     const [groupsCount, usersCount, messagesCount, totalChatsCount] = await Promise.all([
        Chat.countDocuments({ groupChat: true }),
        User.countDocuments(),
        Message.countDocuments(),
        Chat.countDocuments()
     ]);

     const today = new Date();
     const last7Days = new Date();
     last7Days.setDate(last7Days.getDate() - 7);

     const last7DaysMessages = await Message.find({
      createdAt: { $gte: last7Days, $lte: today}
     }).select("createdAt");

     const messages = new Array(7).fill(0);

     const dayInMiliseconds = 24 * 60 * 60 * 1000;

     last7DaysMessages.forEach((message) => {
        const indexApprox = (today.getTime() - message.createdAt.getTime()) / dayInMiliseconds;

        const index = Math.floor(indexApprox);

        messages[6 - index]++;
     })

     const stats = {
        groupsCount,
        usersCount,
        messagesCount,
        totalChatsCount,
        messagesChart: messages,
     }

     return res.status(200).json({
        success: true,
        stats,
     });
});

const adminLogOut = TryCatch(async (req, res) => {
    return res.status(200).cookie("adminchatapptoken", "",{
        ...cookieOptions,
        maxAge: 0
    }).json({
        success: true,
        message: "Admin logged out successfully"
    });
});

export { allUsers, allChats, allMessages, getDashboardStats , adminLogin, adminLogOut, getAdminData };