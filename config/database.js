import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const connectDB = async ()=>{
    const{connection} = await mongoose.connect(process.env.MONGO_URL);

    console.log(`MongoDB connectend with ${connection.host}`)
}