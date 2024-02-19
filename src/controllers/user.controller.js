import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave:false})

        return {accessToken, refreshToken}
    }
    catch(err){
        throw new ApiError(500,"Something went wrong while generating access tokens ")
    }
}


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

    const existedUser = await User.findOne({
        $or: [{username},{emails}]
    })

    if(existedUser){
        throw new ApiError(409,"User already registered")
    }

    //check for images

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar path not found")
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
        avatar: avatar.url,
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

const loginUser = asyncHandler(async (req, res) =>{
    // req body -- > body
    // username or email
    // find the user if exist
    // is user available check pw
    //if pw correct generate access token and refresh token and give to user
    //send cookie

    //requesting for data from body
    const {username,emails,password} = req.body

    // checking for username and email
    if(!username || !emails ){
        throw new ApiError(400,"usernames or emails is required")
    }
    //we have to request database find any one of them if both username and email is provided
    const user = await User.findOne({
        $or:[{username},{emails}]
    })

    if(!user){
        throw new ApiError(404,"User not found")
    }

    //pw checking
    const isPasswordValid = await user.isPasswordCorrect(password) 

    if(!isPasswordValid){
        throw new ApiError(404,"Password is not valid")
    }

    //create access and refresh token
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    //send it to cookies
    const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(200,{
            user:accessToken,refreshToken
        },"user logged in successfully")
    )
})

const logoutUser = asyncHandler(async (req, res) =>{
    User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken: undefined,
        }
    },
        {
            new:true
        }
    )
    const options = {
        httpOnly: true,
        secure:true
    }
    return res.status(200).clearCookie
("accesstoken",options).clearCookie("refreshtoken",options).json(new ApiResponse(200,{},"user logged out"))

})

export {registerUser,loginUser,logoutUser} 