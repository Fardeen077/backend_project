import connectDB from "./db/index.js";
import dotenv from "dotenv"
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("Mongo bd connection in failed !!!", err);
        process.exit(1);
    })












// this is secound aproch

// import express from "express"
// const app = express()
//     ; (async () => {
//         try {
//             await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//             app.on("error", (error) => {
//                 console.log("Error", error);
//                 throw error;
//             });
//             app.listen(process.env.PORT, () => {
//                 console.log(`App is listening on port, ${process.env.PROT}`);

//             })
//         } catch (error) {
//             console.log("ERROR: ", error);
//             throw error
//         }
//     })();