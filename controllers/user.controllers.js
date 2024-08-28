import { compare } from "bcrypt";
import {User} from "../models/user.model.js";
import { cookieOptions, emitEvent, sendToken, uploadFilesToCloudinary} from "../utils/features.js";
import {TryCatch} from "../middlewares/error.js";
import {ErrorHandler} from "../utils/utility.js";
import { Chat } from "../models/chat.model.js";
import {  Request } from "../models/request.model.js";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import {getOtherMember} from "../lib/helper.js"
import { CHATAPPTOKEN } from "../constants/config.js";

const newUser = TryCatch(async (req, res, next) => {
    const { name, username, password, bio } = req.body;
  
     const file = req.file ;
  
     if (!file) return next(new ErrorHandler("Please Upload Avatar"));
  
    const result = await uploadFilesToCloudinary([file]);

  
    const avatar = {
      public_id: result[0].public_id,
      url: result[0].url,
    };
  
    const user = await User.create({
      name,
      bio,
      username,
      password,
      avatar,
    });
  
    sendToken(res, user, 201, "User created");
  });
  

const login = TryCatch(async (req, res, next) => {  
    const { username, password } = req.body;
  
    const user = await User.findOne({ username }).select("+password");
  
    if (!user){
      return next(new ErrorHandler("Invalid Username or Password", 404));
    }
  
      const isMatch = await compare(password, user.password);
    
      if (!isMatch) return next(new ErrorHandler("Invalid Username or Password", 404));
  
    sendToken(res, user, 200, `Welcome Back, ${user.name}`);
  });

const getMyProfile = TryCatch(async(req, res) => {
  const user =  await User.findById(req.user);
    res.status(200).json({
        success: true,
        user,
    }); 
});

const logout = TryCatch(async(req, res) => {
    return res.status(200).cookie("chatapptoken", "", 
      {
      ...cookieOptions, maxAge: 0,
    }).json({
        success: true,
        message: "Logged out successfully",
    }); 
});

const searchUser = TryCatch(async(req, res) => {

  const { name= "" } = req.query;

  const myChats = await Chat.find({ groupChat: false, members: req.user });

  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

  const allUsersExceptMeAndFriends = await User.find({
    _id: { $nin: allUsersFromMyChats },
    name: { $regex: name, $options: "i" },
  }); 

  const users = allUsersExceptMeAndFriends.map(({_id,name, avatar,
  }) => ({
    _id,
    name,
    avatar: avatar.url,
  }));

  return res.status(200).json({
      success: true,
      users,
  }); 
});

const sendFriendRequest = TryCatch(async(req, res, next) => {
    const { userId } = req.body;

    const request = await Request.findOne({
        $or: [
            { sender: req.user, receiver: userId },
            { sender: userId, receiver: req.user },
        ],
    })

    if (request) return next(new ErrorHandler("Request already sent", 400));

    await Request.create({
        sender: req.user,
        receiver: userId, 
    });

    emitEvent(req, NEW_REQUEST, [userId]);

    return res.status(200).json({
        success: true,
        message: "Friend Request sent",
    });
});


const acceptFriendRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body;  
  
  const request = await Request.findById(requestId)
  .populate("sender", "name")
  .populate("receiver", "name");  

  if (!request) return next(new ErrorHandler("Request not found", 404));

  if (request.receiver._id.toString() !== req.user.toString())
    return next(
      new ErrorHandler("You are not authorized to accept this request", 401)
    );

  if (!accept) {
    await request.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Friend Request Rejected",
    });
  }

  const members = [request.sender._id, request.receiver._id];

  await Promise.all([
    Chat.create({
      members,
      name: `${request.sender.name}-${request.receiver.name}`,
    }),
    request.deleteOne(),
  ]);

  emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Friend Request Accepted",
    senderId: request.sender._id,
  });
});


const getAllNotifications = TryCatch(async(req, res, next) => {
  
      const requests = await Request.find({ receiver: req.user }).populate("sender", "name avatar");
     
      if(!requests) return next(new ErrorHandler("No Notifications", 404));

      const allRequests = requests.map(({_id, sender}) => ({
          _id,
          sender: {
             _id: sender._id,
              name: sender.name,
              avatar: sender.avatar.url,
          }
      }));

      return res.status(200).json({
          success: true,
         allRequests,
      });
});


const getMyFriends = TryCatch(async(req, res) => {
    const chatId = req.query.chatId;

    const chats = await Chat.find({
        members: req.user,
        groupChat: false,
       }).populate("members", "name avatar");

       const friends = chats.map(({ members}) => {
        const otherUser = getOtherMember(members, req.user);

        return {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar.url,
        }
    });

    if(chatId) {

      const chat = await Chat.findById(chatId);

      const availableFriends = friends.filter((friend) => !chat.members.includes(friend._id));

      return res.status(200).json({
          success: true,
          friends: availableFriends,
      });
    }
    else{
      return res.status(200).json({
        success: true,
        friends,
    });
    }
});

export { login, newUser, getMyProfile, logout, searchUser, sendFriendRequest, acceptFriendRequest, getAllNotifications, getMyFriends };   