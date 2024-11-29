import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORE_ORIGIN,
    Credentials: true,
}));

// Limit the size of incoming JSON payloads to 10kb to prevent excessive data causing the website to crash.
app.use(express.json({ limit: "10kb" }));

// Use `urlencoded` to parse URL-encoded data. This is useful for handling form submissions.
// For example, searching for "Fardeen Khan" on Google results in a URL like `fardeen+khan`, which needs parsing.
// Setting a limit of 10kb ensures we avoid processing excessively large payloads.
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Serve static files like images, stylesheets, and scripts from the "public" folder, making them accessible to all users.
app.use(express.static("public"));

app.use(cookieParser())

export { app };
