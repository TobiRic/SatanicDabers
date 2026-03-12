
const express=require("express")
const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const multer=require("multer")
const {CloudinaryStorage}=require("multer-storage-cloudinary")
const cloudinary=require("cloudinary").v2
const cors=require("cors")

const app=express()
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

const ADMIN_USER="Satanic_Dabers"
const ADMIN_PASS="Satanic432101"
const SECRET="super_secret"

mongoose.connect(process.env.MONGO_URI)

cloudinary.config({
 cloud_name:process.env.CLOUDINARY_NAME,
 api_key:process.env.CLOUDINARY_KEY,
 api_secret:process.env.CLOUDINARY_SECRET
})

const storage=new CloudinaryStorage({
 cloudinary:cloudinary,
 params:{resource_type:"video",folder:"satanic_dabers_videos"}
})

const upload=multer({storage})

const Video=mongoose.model("Video",{
title:String,
url:String,
likes:{type:Number,default:0},
dislikes:{type:Number,default:0},
comments:[{
user:String,
text:String,
date:Date
}]
})

function auth(req,res,next){
const token=req.headers.authorization
if(!token) return res.sendStatus(403)
try{jwt.verify(token,SECRET);next()}catch{res.sendStatus(403)}
}

app.post("/api/login",(req,res)=>{
const{username,password}=req.body
if(username===ADMIN_USER&&password===ADMIN_PASS){
const token=jwt.sign({u:username},SECRET)
res.json({token})
}else res.status(401).json({error:"login failed"})
})

app.post("/api/upload",auth,upload.single("video"),async(req,res)=>{
const v=await Video.create({title:req.body.title,url:req.file.path})
res.json(v)
})

app.get("/api/videos",async(req,res)=>{
res.json(await Video.find())
})

app.post("/api/like/:id",async(req,res)=>{
const v=await Video.findById(req.params.id)
v.likes++
await v.save()
res.json(v)
})

app.post("/api/dislike/:id",async(req,res)=>{
const v=await Video.findById(req.params.id)
v.dislikes++
await v.save()
res.json(v)
})

function spamCheck(text){
const banned=["http://","https://","spam","xxx"]
return banned.some(w=>text.toLowerCase().includes(w))
}

app.post("/api/comment/:id",async(req,res)=>{
if(spamCheck(req.body.text)) return res.status(400).json({error:"spam detected"})
const v=await Video.findById(req.params.id)
v.comments.push({user:req.body.user,text:req.body.text,date:new Date()})
await v.save()
res.json(v)
})

app.listen(process.env.PORT||3000,()=>console.log("Server running"))
