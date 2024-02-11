import mongoose,{Schema} from "mongoose";
import { Jwt } from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username:{
        required: true,
        type:String,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    emails:{
        required: true,
        type:String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname:{
        required: true,
        type:String,
        trim: true,
        index: true,
    },
    avatar:{
        required: true,
        type:String, //cloudinary url for image
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    password: {
        type: String,
        required: [true,'Password is required'],
    },
    refreshToke:{
        type: String,
    },
},
{timestamps:true});

// checking if the pw is not modified then encrypt and save  it 
userSchema.pre("save",async function (next){
    if(!this.isModified('password')) return next()
    this.password = bcrypt.hash(this.password,10)
    next()
}
)

// function used to match the pw 
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}


 
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this.id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User",userSchema);