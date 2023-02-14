import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true,"Please Enter your name"],
    },
    email: {
        type: String,
        unique: true,
        validate: validator.isEmail,
        require: [true,"Please Enter your email"],
    },
    password: {
        type: String,
        require: [true,"Please Enter your password"],
        minLength: [6,"Password must be at least 6 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: ['admin','user'], 
        default: 'user',
    },
    subscription: {
        id: String,
        status: String,
    },
    avatar: {
        public_id: {
            type: String,
            require: true, 
        },
        url : {
            type: String,
            require: true,
        },
    },
    playlist: [
        {
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
            poster: String,
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: String,

}, {timestamps: true});


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

userSchema.methods.getJWTToken = function (){
    return jwt.sign({_id:this._id}, 'kfqifqfn217184ajfaaf9',{
        expiresIn: "15d",
    })
};

userSchema.methods.getResetToken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + (15*60*1000);

    return resetToken;
}

const User = mongoose.model("User",userSchema);

export default User;