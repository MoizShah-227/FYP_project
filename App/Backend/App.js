
import express from "express";
import cors from "cors";
import UserRoute from "./Routes/UserRoute.js"
import AdminRoute from "./Routes/AdminRoute.js"
import AnnoucementRoute from "./Routes/AnnoucementRoute.js"
const app = express();

app.use(express.json());
app.use(cors());

app.use('/user',UserRoute)
app.use('/admin',AdminRoute)
app.use('/annoucement',AnnoucementRoute)

app.listen(5004, () => {
  console.log("Server is running on port 5004");
})
