import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async(req,res)=>{
    //get user information
    // validate user - not empty
    //check if already registered
    //check for images
    //upload image on cloudanary
    //create user-object
    //remove pw and refresh token
    //check for creation
    //return res
    //{user info getting}
    const{username,password,fullname,emails} = req.body
    console.log(username,fullname,emails)
    //{validation check}
    if(
        [fullname,emails,username,password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    //check if user is already registered

    const existedUser = User.findOne({
        $or: [{username},{emails}]
    })

    if(existedUser){
        throw new ApiError(409,"User already registered")
    }

    //check for images

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar not found")
    }
    //upload images on cloudinary server

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"avatar not found")
    }
    //create object
    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        emails,
        password,
        username:username.toLowerCase()
    })

    //check for user creation

    const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong")
    }

    //return response

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Regestired Successfully")
    )

})

export {registerUser} 