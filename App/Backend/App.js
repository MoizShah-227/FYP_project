
import express from "express";
import cors from "cors";
import UserRoute from "./Routes/UserRoute.js"
import AdminRoute from "./Routes/AdminRoute.js"
import AnnoucementRoute from "./Routes/AnnoucementRoute.js"
import PostsRoute from "./Routes/PostsRoute.js"
import MessageRoute from "./Routes/MessagesRoute.js"
const app = express();

app.use(express.json());
app.use(cors());

app.use('/user',UserRoute)
app.use('/admin',AdminRoute)
app.use('/admin',AnnoucementRoute)
app.use('/posts',PostsRoute)
app.use('/message',MessageRoute)

app.listen(5004, () => {
  console.log("Server is running on port 5004");
})
