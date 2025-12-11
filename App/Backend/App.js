
import express from "express";
import cors from "cors";
import UserRoute from "./Routes/UserRoute.js"
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api',UserRoute)

app.listen(5004, () => {
  console.log("Server is running on port 5004");
})
