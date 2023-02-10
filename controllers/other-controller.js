import { catchAsyncError } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../utils/errorHandler.js';
import { sendEmail } from '../utils/sendEmail.js'; 
import Stats from '../model/stats.js';


export const contact = catchAsyncError(
    async (req,res,next) => {
        const {name,email,message} = res.body;
        const to = process.env.myMail;
        const subject="Contact from CourseBundler";
        const text = `I am ${name} and my email is ${email} .\n${message}`;
        await sendEmail(to,subject,text);

        res.status(201).json({
            success: true,
            message:"Your message has been sent.",
        })
    }
);


export const courseRequest = catchAsyncError(
    async (req,res,next) => {
        const {name,email,course} = res.body;
        const to = process.env.myMail;
        const subject="Request of a course on CourseBundler";
        const text = `I am ${name} and my email is ${email} .\n${course}`;
        await sendEmail(to,subject,text);

        res.status(201).json({
            success: true,
            message:"Your request has been sent.",
        })
    }
);


export const getDashboardStats = catchAsyncError(async (req, res, next) => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(3);
  
    const statsData = [];
  
    for (let i = 0; i < stats.length; i++) {
      statsData.unshift(stats[i]);
    }
    const requiredSize = 3 - stats.length;
  
    for (let i = 0; i < requiredSize; i++) {
      statsData.unshift({
        users: 0,
        subscription: 0,
        views: 0,
      });
    }
  
    const usersCount = statsData[2].users;
    const subscriptionCount = statsData[2].subscription;
    const viewsCount = statsData[2].views;
  
    let usersPercentage = 0,
      viewsPercentage = 0,
      subscriptionPercentage = 0;
    let usersProfit = true,
      viewsProfit = true,
      subscriptionProfit = true;
  
    if (statsData[1].users === 0) usersPercentage = usersCount * 100;
    if (statsData[1].views === 0) viewsPercentage = viewsCount * 100;
    if (statsData[1].subscription === 0)
      subscriptionPercentage = subscriptionCount * 100;
    else {
      const difference = {
        users: statsData[2].users - statsData[1].users,
        views: statsData[2].views - statsData[1].views,
        subscription: statsData[2].subscription - statsData[1].subscription,
      };
  
      usersPercentage = (difference.users / statsData[1].users) * 100;
      viewsPercentage = (difference.views / statsData[1].views) * 100;
      subscriptionPercentage =
        (difference.subscription / statsData[1].subscription) * 100;
      if (usersPercentage < 0) usersProfit = false;
      if (viewsPercentage < 0) viewsProfit = false;
      if (subscriptionPercentage < 0) subscriptionProfit = false;
    }
  
    res.status(200).json({
      success: true,
      stats: statsData,
      usersCount,
      subscriptionCount,
      viewsCount,
      subscriptionPercentage,
      viewsPercentage,
      usersPercentage,
      subscriptionProfit,
      viewsProfit,
      usersProfit,
    });
  });