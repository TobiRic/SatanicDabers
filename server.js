
const express = require("express")
const mongoose = require("mongoose")
const multer = require("multer")
const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")

const app = express()

app.use(express.json())
app.use(express.static("public"))

mongoose.connect(process.env.MONGO_URI)

cloudinary.config({
 cloud_name: process.env.CLOUDINARY_NAME,
 api_key: process.env.CLOUDINARY_KEY,
 api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
 cloudinary: cloudinary,
 params: {
  folder: "satanic_dabers_videos",
  resource_type: "video"
 }
})

const upload = multer({ storage })

const Video = mongoose.model("Video",{
 title:String,
 description:String,
 url:String,
 views:{type:Number,default:0},
 likes:{type:Number,default:0},
 dislikes:{type:Number,default:0},
 comments:[{user:String,text:String}]
})

app.post("/api/upload", upload.single("video"), async (req,res)=>{

 const video = await Video.create({
  title:req.body.title,
  description:req.body.description,
  url:req.file.path
 })

 res.json(video)

})

app.get("/api/videos", async (req,res)=>{
 const videos = await Video.find().sort({_id:-1})
 res.json(videos)
})

app.post("/api/view/:id", async (req,res)=>{
 const v = await Video.findById(req.params.id)
 v.views++
 await v.save()
 res.json(v)
})

app.post("/api/like/:id", async (req,res)=>{
 const v = await Video.findById(req.params.id)
 v.likes++
 await v.save()
 res.json(v)
})

app.post("/api/dislike/:id", async (req,res)=>{
 const v = await Video.findById(req.params.id)
 v.dislikes++
 await v.save()
 res.json(v)
})

app.post("/api/comment/:id", async (req,res)=>{

 const v = await Video.findById(req.params.id)

 v.comments.push({
  user:req.body.user || "Guest",
  text:req.body.text
 })

 await v.save()

 res.json(v)

})

app.delete("/api/video/:id", async (req,res)=>{

 await Video.findByIdAndDelete(req.params.id)
 res.json({success:true})

})

app.listen(process.env.PORT || 3000, ()=>{
 console.log("Server running")
})
