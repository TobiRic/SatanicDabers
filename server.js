
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


const fs = require('fs')

const commentsFile = './comments.json'
const likesFile = './likes.json'

if(!fs.existsSync(commentsFile)) fs.writeFileSync(commentsFile,'{}')
if(!fs.existsSync(likesFile)) fs.writeFileSync(likesFile,'{}')

app.get('/comments/:video',(req,res)=>{
 const data=JSON.parse(fs.readFileSync(commentsFile))
 res.json(data[req.params.video]||[])
})

app.post('/comments/:video',(req,res)=>{
 const data=JSON.parse(fs.readFileSync(commentsFile))
 if(!data[req.params.video]) data[req.params.video]=[]
 const id=Date.now()
 data[req.params.video].push({id,text:req.body.text})
 fs.writeFileSync(commentsFile,JSON.stringify(data,null,2))
 res.json({ok:true})
})

app.delete('/comments/:video/:id',(req,res)=>{
 const data=JSON.parse(fs.readFileSync(commentsFile))
 const v=req.params.video
 if(!data[v]) return res.json({})
 data[v]=data[v].filter(c=>c.id!=req.params.id)
 fs.writeFileSync(commentsFile,JSON.stringify(data,null,2))
 res.json({ok:true})
})

app.get('/like/:video',(req,res)=>{
 const data=JSON.parse(fs.readFileSync(likesFile))
 res.json(data[req.params.video]||{likes:0,dislikes:0})
})

app.post('/like/:video/:type',(req,res)=>{
 const data=JSON.parse(fs.readFileSync(likesFile))
 const v=req.params.video
 if(!data[v]) data[v]={likes:0,dislikes:0}
 if(req.params.type==='like') data[v].likes++
 if(req.params.type==='dislike') data[v].dislikes++
 fs.writeFileSync(likesFile,JSON.stringify(data,null,2))
 res.json({ok:true})
})
