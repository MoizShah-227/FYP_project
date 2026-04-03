
import express from "express";
import cors from "cors";
import UserRoute from "./Routes/UserRoute.js"
import AdminRoute from "./Routes/AdminRoute.js"
import AnnoucementRoute from "./Routes/AnnoucementRoute.js"
import PostsRoute from "./Routes/PostsRoute.js"
import MessageRoute from "./Routes/MessagesRoute.js"
import Education from "./Routes/EducationRoute.js"
import ShowTeacherModelRoutes from "./Routes/showTeacherModelRoutes.js"
import session from "express-session";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,   // true only with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use('/user',UserRoute)
app.use('/admin',AdminRoute)
app.use('/admin',AnnoucementRoute)
app.use('/posts',PostsRoute)
app.use('/message',MessageRoute)
app.use('/education',Education)
app.use('/showTeacherModel',ShowTeacherModelRoutes)
app.use("/uploads", express.static("uploads"));

//localhost:5004/user/login
app.listen(5004, () => {
  console.log("Server is running on port 5004");
})
  