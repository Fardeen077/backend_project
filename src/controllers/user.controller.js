import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({ vaildateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};
const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const { fullName, email, username, password } = req.body
    //console.log("email: ", email);
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields cannot be empty");
    }
    const existsUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existsUser) {
        throw new ApiError(400, "User already exists")
    };

    const avatarLocalPath = req.files.avatar[0]?.path
    // console.log(req.files);
    // console.log(avatarLocalPath);
    // const coverImageLocalPath = res.fiels?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }
    // if(!avatar){
    //     throw new ApiError(400, "Avatar is required")
    // }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar || !coverImage) {
        throw new ApiError(400, "Error uploading images")
    };
    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase()
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Error creating user");
    }
    return res.status(201).json(new ApiResponse(201, "User created", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
    // get user data from frontend
    // validate email and password
    // check if user exists or not
    // then check for password
    // generate jwt access and refresh token
    // send cookies to frontrnd
    const { email, username, password } = req.body;

    if (!email && !username) {
        throw new ApiError(400, "Email and password are required")
    };

    const user = await User.findOne({ $or: [{ email }, { username: email }] })
    if (!user) {
        throw new ApiError(404, "User not found");
    };

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid  password")
    };

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options).json(new ApiResponse(200,
            {
                user: loggedUser, accessToken, refreshToken
            },
            "User logged in successfully"
        ));
});

const logoutUser = asyncHandler(async (req, res) => {
    // clear cookies
    User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshAccessToken || req.body.refreshAccessToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }
        const options = {
            httpOnly: true,
            secure: true,
        }
        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invaild old password");
    }
    user.password = newPassword
    await user.save({ vaildateBeforeSave: false })
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password chanage successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "current user fatched successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!fullName || !email) {
        throw new ApiError(400, "All field are required");
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            }
        },
        { new: true },
    ).select("-password")
    return res
        .status(200,
            user,
            "Account details update successfully"
        )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while ploading");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "avatar is update successfully")
    )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const updateUserCoverImage = req.file?.path
    if (!updateUserCoverImage) {
        throw new ApiError(400, "CoverImage file is missing");
    }
        const coverImage  = await uploadOnCloudinary(updateUserCoverImage)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while ploading");
    }
   const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "cover image is update successfully")
    )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
}