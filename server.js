
const express = require("express")
const mongoose = require("mongoose")
const multer = require("multer")
const fs = require("fs")

const app = express()

app.use(express.json())
app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/satanic_dabers")

const Video = mongoose.model("Video",{
title:String,
description:String,
file:String,
views:{type:Number,default:0},
likes:{type:Number,default:0},
dislikes:{type:Number,default:0},
comments:[{user:String,text:String}]
})

const Page = mongoose.model("Page",{
name:String,
content:String
})

const Settings = mongoose.model("Settings",{
tabs:[String]
})

const storage = multer.diskStorage({
destination:(req,file,cb)=>cb(null,"uploads/"),
filename:(req,file,cb)=>cb(null,Date.now()+"_"+file.originalname)
})

const upload = multer({storage})

app.post("/api/upload",upload.single("video"),async(req,res)=>{

if(!req.file){
return res.status(400).json({error:"No file"})
}

const video = await Video.create({
title:req.body.title,
description:req.body.description,
file:req.file.filename
})

res.json(video)

})

app.get("/api/videos",async(req,res)=>{
const videos = await Video.find().sort({_id:-1})
res.json(videos)
})

app.post("/api/view/:id",async(req,res)=>{
const video = await Video.findById(req.params.id)
video.views++
await video.save()
res.json(video)
})

app.post("/api/like/:id",async(req,res)=>{
const video = await Video.findById(req.params.id)
video.likes++
await video.save()
res.json(video)
})

app.post("/api/dislike/:id",async(req,res)=>{
const video = await Video.findById(req.params.id)
video.dislikes++
await video.save()
res.json(video)
})

app.post("/api/comment/:id",async(req,res)=>{
const video = await Video.findById(req.params.id)
video.comments.push({user:req.body.user,text:req.body.text})
await video.save()
res.json(video)
})

app.delete("/api/video/:id",async(req,res)=>{
const video = await Video.findById(req.params.id)
if(video){
try{fs.unlinkSync("uploads/"+video.file)}catch(e){}
await video.deleteOne()
}
res.json({success:true})
})

app.get("/api/page/:name",async(req,res)=>{
let page = await Page.findOne({name:req.params.name})
if(!page) page = await Page.create({name:req.params.name,content:""})
res.json(page)
})

app.post("/api/page/:name",async(req,res)=>{
let page = await Page.findOne({name:req.params.name})
if(!page) page = await Page.create({name:req.params.name})
page.content = req.body.content
await page.save()
res.json(page)
})

app.get("/api/tabs",async(req,res)=>{
let s = await Settings.findOne()
if(!s) s = await Settings.create({tabs:["Home","Videos","Upload","Community","Admin"]})
res.json(s.tabs)
})

app.post("/api/tabs",async(req,res)=>{
let s = await Settings.findOne()
if(!s) s = await Settings.create()
s.tabs = req.body.tabs
await s.save()
res.json(s.tabs)
})

app.listen(3000,()=>console.log("Server running"))
