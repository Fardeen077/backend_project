import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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
        throw new ApiError(400, "fullname cannot be empty");
    }
    const existsUser = User.findone({
        $or: [{ email }, { username }]
    })
    if (existsUser) {
        throw new ApiError(400, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // console.log(req.files);
    console.log(avatarLocalPath);
    const coverImageLocalPath = res.fiels?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar || !coverImage) {
        throw new ApiError(400, "Error uploading images")
    }
    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || null,
        password,
        username: username.toLowerCase()
    });
    const createdUser = await User.findById(user._id,).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Error creating user");
    }
    return res.status(201).json(new ApiResponse(201, "User created", createdUser));
});
export { registerUser }