import mongoose from 'mongoose';


const statsSchema = new mongoose.Schema({
    users: {
        type: Number,
        default: 0,
    },
    subscription:{
        type: Number,
        default: 0,
    },
    views: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
});


const Stats = mongoose.model("Stats", statsSchema);
export default Stats;