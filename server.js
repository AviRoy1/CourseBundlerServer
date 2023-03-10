import express from 'express';
import dotenv from 'dotenv'
import {connectDB} from './config/database.js';
import apiRouter from './routes/index.js';
import ErrorMiddleware from './middlewares/error.js';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import nodeCron from 'node-cron';
import Stats from './model/stats.js';
import Razorpay from 'razorpay';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );

connectDB();
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

app.use('/api',apiRouter);
app.get("/", (req,res)=>{
    res.send(
        `<h1>Site is working. click <a href=${process.env.FRONTEND_URL}>
            here</a> to visit frontend.`
    )
})

export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
});

nodeCron.schedule("0 0 0 1 * *" , async ()=>{
    try {
        await Stats.create({});
    } catch (error) {
        console.log(error);
    }
});

const startServer = ()=>{
    
    app.use(ErrorMiddleware);
    app.listen(process.env.PORT,()=>{
        console.log(`server is running on port ${process.env.PORT}`)
    })
}

startServer();

