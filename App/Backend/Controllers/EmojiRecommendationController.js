import { sql, poolPromise } from "../Config/DB.js";
import dotenv from "dotenv";
import Sentiment from "sentiment";


const sentiment = new Sentiment();
dotenv.config(); 
export const emojiRecommendation = async (req, res) => {
    const text =req.params;
    // console.log(text.text);
    const result = sentiment.analyze(text.text);
    console.log(result);    
};
