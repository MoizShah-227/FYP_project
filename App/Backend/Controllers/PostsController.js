import { sql, poolPromise } from "../Config/DB.js";

export const PublicPosts=async (req,res)=>{
    try{
        const pool = await poolPromise;
        const request  = await pool.request().query("select a.A_id,u.image,u.name, a.created_at, a.message from Annoucements a join users u on u.u_id =a.created_by where a.type='public'");
        res.status(200).send(request.recordsets)
    }catch(err){
        res.status(500).send(err.message);
    }
}

export const FacultyPosts=async (req,res)=>{
    try{
        const pool = await poolPromise;
        const request  = await pool.request().query("select a.A_id,u.image,u.name, a.created_at, a.message from Annoucements a join users u on u.u_id =a.created_by where a.type='faculty'");
        res.status(200).send(request.recordsets)
    }catch(err){
        res.status(500).send(err.message);
    }
}