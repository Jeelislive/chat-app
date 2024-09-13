import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.js";
import { CHATAPPTOKEN } from "../constants/config.js";
import { User } from "../models/user.model.js";


const isAuthenticated = TryCatch(async (req, res, next) => {
   const token = req.cookies[CHATAPPTOKEN];
   
   if (!token) return next(new ErrorHandler("Please login to access this route", 401));

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decodedData._id;

    next();
});     

const onlyAdmin = TryCatch(async (req, res, next) => {
    const token = req.cookies["adminchatapptoken"];
    
    if (!token) 
          return next(new ErrorHandler("Only Admin can acess this Route", 401));
 
     const adminId = jwt.verify(token, process.env.JWT_SECRET);
 
    const adminSecretKey = process.env.ADMIN_SECRET_KEY;

    const isMatched = adminId === adminSecretKey;

    if (!isMatched) return next(new ErrorHandler("Only Admin can acess this Route", 401));
     
     next();
 
 
 });

const socketAuthenticator = async(err, socket, next) => {
    try {
        if(err) return next(err);

        const authToken = socket.request.cookies[CHATAPPTOKEN];

        if (!authToken){
             return next(new ErrorHandler("Please login to access this route", 401));}

        const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

        const user = await User.findById(decodedData._id);

        if (!user){ 
            return next(new ErrorHandler("Please login to access this route", 401));}

        socket.user = user;

        return next();

    } catch (error) {
        console.log(error);
        return next(new ErrorHandler("Please login to access this route", 401));    
    }
}

export { isAuthenticated , onlyAdmin, socketAuthenticator};