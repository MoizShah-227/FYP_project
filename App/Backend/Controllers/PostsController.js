import { sql, poolPromise } from "../Config/DB.js";

export const PublicPosts=async (req,res)=>{
    try{
        const pool = await poolPromise;
        const result  = await pool.request().query("select a.A_id,u.image,u.name, a.created_at, a.message from Announcements a join users u on u.u_id =a.created_by where a.type='public'");
        res.status(200).send(result.recordsets)
    }catch(err){
        res.status(500).send(err.message);
    }
}

export const FacultyPosts=async (req,res)=>{
    const pool = await poolPromise;
    try{
        const result  = await pool.request().query("select a.A_id,u.image,u.name, a.created_at, a.message from Announcements a join users u on u.u_id =a.created_by where a.type='faculty'");
        res.status(200).send(result.recordsets)
    }catch(err){
        res.status(500).send(err.message);
    }
}

export const ReactOnPosts=async (req,res)=>{
    const {user_id,announcement_id,emoji_id} = req.body;
    try{
        const pool = await poolPromise;
        const result = await pool.request()
        .input("u_id",sql.Int,user_id)
        .input("a_id",sql.Int,announcement_id)
        .input("e_id",sql.Int,emoji_id)
        .query("insert into Announcement_Reaction(user_id,announcement_id,emoji_id) values(@u_id,@a_id,@e_id)");
        res.status(200).send(result)
    }catch(err){
        res.status(500).send(err.message);
    }
}

export const PostReactions=async(req,res)=>{
    const{id} =req.params;
    try{
        const pool = await poolPromise;
    const result = await pool.request()
    .input("id",sql.Int,id)
    .query("SELECT u.name,u.image,e.emoji FROM Users u JOIN Announcement_Reaction ar ON u.u_id = ar.user_id JOIN emojis e ON e.E_id = ar.emoji_id where ar.announcement_id=@id");
    res.status(200).send(result.recordsets);
    }catch(err){
    res.status(500).send(err.message);
    }
}

