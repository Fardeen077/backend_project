import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"; // fs is file system and its default install in node js 

// Configuration
cloudinary.config({
    cloud_name: 'dmpojo6du',
    api_key: '725226767956986',
    api_secret: 'l0q3OY4k1Lg3zdf6OuSnNusiGRI' // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload the file on  cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            response_type: "auto"
        })
        // console.log(response);

        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath) // remove the loacally file save temporary file as the uplode operation got success
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the loacally file save temporary file as the uplode operation got failed
        // console.log(error);
        return null
    }
}
// Upload an image
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });

//     console.log(uploadResult);

//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });

//     console.log(optimizeUrl);

//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });

//     console.log(autoCropUrl);    


//  export {uploadOnCloudinary}
export { uploadOnCloudinary };