import User from '../model/User-model.js';
import Stats from '../model/stats.js';
import Course from '../model/Course-model.js';
import {catchAsyncError} from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../utils/errorHandler.js'
import { sendToken } from '../utils/sendToken.js';
import crypto from 'crypto';
import getDataUri from '../utils/datauri.js';
import cloudinary from 'cloudinary';
import { sendEmail } from '../utils/sendEmail.js';


export const createUser = catchAsyncError (
    async (req,res,next) => {
        const {name,email,password} = req.body;
        if(!name || !email || !password) 
            return next(new ErrorHandler("please fill all fields",400));

        let user = await User.findOne({ email });
        if(user)
            return next(new ErrorHandler("User Already Exist", 409))
        //  upload file on cloudinary
        const file = req.file;
        const fileuri = getDataUri(file);
        const myCloud = await cloudinary.v2.uploader.upload(fileuri.content); 

        user = await User.create({
            name,
            email,
            password,
            avater: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }
        });
        sendToken(res,user,"Successfully register",200);
     
    }
)

export const loginUser = catchAsyncError(
    async (req,res,next) => {
        const { email,password } = req.body;
        if(!email || !password) {
            return next(new ErrorHandler("please fill all fields",400));
        }
        const user = await User.findOne({email}).select("+password");
        if(!user) {
            return next(new ErrorHandler("Incorrect Email or Password",401));
        }
        const isMatch = await user.comparePassword(password); 
        if(!isMatch) {
            return next(new ErrorHandler("Incorrect Email or Password",401));
        }

        sendToken(res,user,`welcome back ${user.name}`,200);

    }
);

export const logout = catchAsyncError(
    async (req,res,next) => {
         res.status(200).cookie("token",null,{
            expires: new Date(Date.now()),
            httpOnly: true,
            // secure: true,
            sameSite: "none",
        }).json({
            success: true,
            message: "Logout successfully",
        });
    }
) 

export const getMyProfile = catchAsyncError(
    async(req,res,next) => {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            success: true,
            user
        })
    }
);


export const changePassword = catchAsyncError(
    async (req,res,next) => {
        const { oldPassword,newPassword } = req.body;
        if(!oldPassword || !newPassword)
            return next(new ErrorHandler("Fill all fields",402));
        const user = await User.findById(req.user._id).select("+password");
        const isMatch = await user.comparePassword(oldPassword);   
        
        if(!isMatch) {
            return next(new ErrorHandler("Incorrect old password!!", 401));
        }
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password Change Successfully",
        })

    }
);



export const updateProfile = catchAsyncError(
    async (req,res,next) => {
        const { name,email } = req.body;
        if(!name || !email)
            return next(new ErrorHandler("Fill all fields",402));

        const user = await User.findById(req.user._id);
        user.name = name;
        user.email=email;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password Change Successfully",
        })

    }
);


export const updateProfilepicture = catchAsyncError(

    async(req,res,next) => {
        const file = req.file;
        const user = await User.findById(req.user._id);
        
        const fileuri = getDataUri(file);
        const myCloud = await cloudinary.v2.uploader.upload(fileuri.content); 
        await cloudinary.v2.uploader.destroy(user.avater.public_id);
        user.avater = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile Picture Updated Successfully",
        })
    }
);


export const forgetPassword = catchAsyncError(
    
    async (req,res,next) => {
        const {email} = req.body;
        const user = await User.findOne({email});
        // console.log(user);
        if(!user) 
            return next(new ErrorHandler("User Not Find",400));

        const resetToken = await user.getResetToken();
        await user.save();
        const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
        const message = `Click on the link to reset your password. ${url}`;

        //Send token via email
        await sendEmail(user.email,"Reset Password",message);
        
        res.status(200).json({
            success: true,
            message: `Reset token has been send to ${user.email}`,
        })

    }
);


export const resetPassword = catchAsyncError(
    async(req,res,next) => {
        const {token} = req.params;
        
        const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {
                $gt: Date.now(),
            }
        });
        if(!user)   return next(new ErrorHandler("Token is invalid or has been expired",401));
        
        user.password = req.body.password;
        user.resetPasswordExpire = undefined;
        user.save();
        res.status(201).json({
            success: true, 
            message: 'Reset Password Successfully',
        })
    }    
);


export const addToPlaylist = catchAsyncError(async (req,res,next) => {
    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.body.id);

    if(!course) return next(new ErrorHandler("Invalid Course Id",404));

    const itemExist = user.playList.find((item)=>{
        if(item.course.toString()===course._id.toString())  return true;
        // return false;
    })

    if(itemExist) return next(new ErrorHandler("Item Already Exist",409));

    user.playList.push({
        course: course._id,
        poster: course.poster.url,
    });

    await user.save();

    res.status(200).json({
        success: true,
        message: "Added to playlist",   
    })

});


export const removeFromPlaylist = catchAsyncError(async (req,res,next) => {

    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.query.id);
    if(!course) return next(new ErrorHandler("Invalid Course Id",404));

    const newPlayList = user.playList.filter(item=>{
        if(item.course.toString!==course._id.toString())    return item;
    })

    user.playList = newPlayList;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Remove From playlist",   
    })
});


export const getAllUser = catchAsyncError(
    async(req,res,next) => {
        const users = await User.find({});

        res.status(200).json({
            success: true,
            users,
        })
    }
);



export const updateUserRole = catchAsyncError(
    async(req,res,next) => {
        const user = await User.findById(req.params.id);

        if(!user) {
            return next(new ErrorHandler("User Not Found", 404));
        }
        if(user.role==="user")  user.role = "admin";
        else user.role = "user";
        await user.save();

        res.status(200).json({
            success: true,
            message: "Role updated!!",
        })
    }
);


export const deleteUser = catchAsyncError(
    async(req,res,next) => {
        const user = await User.findById(req.params.id);

        if(!user) {
            return next(new ErrorHandler("User Not Found", 404));
        }
       
        await cloudinary.v2.uploader.destroy(user.avater.public_id);

        //  Cancel Subscription - TODO
        
        await user.remove();

        res.status(200).json({
            success: true,
            message: "Successfully deleted user",
        })
    }
);


User.watch().on("change", async () => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
  
    const subscription = await User.find({ "subscription.status": "active" });
    stats[0].users = await User.countDocuments();
    stats[0].subscription = subscription.length;
    stats[0].createdAt = new Date(Date.now());
  
    await stats[0].save();
  });