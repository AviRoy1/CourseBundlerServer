import jwt from'jsonwebtoken';
import { catchAsyncError } from './catchAsyncError.js';
import User from '../model/User-model.js';
import ErrorHandler from '../utils/errorHandler.js';



export const isAuthenticated = catchAsyncError(
    async(req,res,next) => {
        const { token } = req.cookies;
        if(!token) {
            return next(new ErrorHandler("Not Logged In",401));
        }
        const decoded = jwt.verify(token,'kfqifqfn217184ajfaaf9');
        req.user = await User.findById(decoded._id);
        // console.log(req.user.name);
        next();
    }
);


export const  authorizeAdmin = catchAsyncError(
    async(req,res,next) => {
        if(req.user.role!=="admin") {
            return next(new ErrorHandler(`${req.user.role} is not allow to access this resourse`,403));

        };
        next();
    }
);


export const  authorizeSubscribers = catchAsyncError(
    async(req,res,next) => {
        if(req.user.subscription.status !== "active" && req.user.role !== "admin") {
            return next(new ErrorHandler("Only subscribers can access this resourse"));
        }
        next();
    }
)

