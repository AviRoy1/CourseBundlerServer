import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({

    title: {
        type: String,
        require: [true,"Please enter course title"],
        minLength: [4, "Title must be at least 4 characters"],
        maxLength: [80, "Title can't exceed 80 characters"],
    },
    description: {
        type: String,
        require: [true,"Please enter course description"],
        minLength: [5, "Description must be at least 5 characters"],
    },
    lectures: [
        {
            title: {
                type: String,
                require: true,
            },
            description: {
                type: String,
                require: true,
            },
            video: {
                public_id: {
                    type: String,
                    require: true,
                },
                url : {
                    type: String,
                    require: true,
                }
            }
        }
    ],
    poster: {
        public_id: {
            type: String,
            require: true,
        },
        url: {
            type: String,
            require: true,
        }
    },
    views: {
        type: Number,
        default: 0,
    },
    numOfVideos: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        require: true,
    },
    createdBy: {
        type: String,
        require: true,
    },

},{timestamps:true});


const Course = mongoose.model("Course",courseSchema);

export default Course;