const express = require("express")
const mongoose = require("mongoose")
const multer = require("multer")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

/*
ADMIN LOGIN
*/

const ADMIN_USER = "Satanic_Dabers"
const ADMIN_PASS = "Satanic432101"

/*
MONGODB
*/

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/satanic_dabers")

const Video = mongoose.model("Video",{
title:String,
file:String,
likes:{type:Number,default:0},
dislikes:{type:Number,default:0},
comments:[
{
user:String,
text:String,
date:Date
}
]
})

/*
UPLOAD SYSTEM
*/

const storage = multer.diskStorage({
destination:(req,file,cb)=>{
cb(null,"uploads/")
},
filename:(req,file,cb)=>{
cb(null,Date.now()+"_"+file.originalname)
}
})

const upload = multer({storage})

/*
ANTI SPAM
*/

function spamCheck(text){

const banned = [
"http://",
"https://",
"spam",
"xxx",
"porn",
"casino"
]

return banned.some(word => text.toLowerCase().includes(word))

}

/*
LOGIN
*/

app.post("/api/login",(req,res)=>{

const {username,password} = req.body

if(username === ADMIN_USER && password === ADMIN_PASS){
res.json({success:true})
}else{
res.status(401).json({error:"login failed"})
}

})

/*
UPLOAD VIDEO
*/

app.post("/api/upload", upload.single("video"), async (req,res)=>{

const v = await Video.create({
title:req.body.title,
file:req.file.filename
})

res.json(v)

})

/*
GET VIDEOS
*/

app.get("/api/videos", async (req,res)=>{

const vids = await Video.find().sort({_id:-1})

res.json(vids)

})

/*
LIKE
*/

app.post("/api/like/:id", async (req,res)=>{

const v = await Video.findById(req.params.id)

v.likes++

await v.save()

res.json(v)

})

/*
DISLIKE
*/

app.post("/api/dislike/:id", async (req,res)=>{

const v = await Video.findById(req.params.id)

v.dislikes++

await v.save()

res.json(v)

})

/*
COMMENT
*/

app.post("/api/comment/:id", async (req,res)=>{

const text = req.body.text

if(spamCheck(text)){
return res.status(400).json({error:"spam detected"})
}

const v = await Video.findById(req.params.id)

v.comments.push({
user:req.body.user || "guest",
text:text,
date:new Date()
})

await v.save()

res.json(v)

})

/*
DELETE VIDEO (ADMIN)
*/

app.delete("/api/video/:id", async (req,res)=>{

await Video.findByIdAndDelete(req.params.id)

res.json({success:true})

})

/*
SERVER
*/

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{

console.log("🔥 Satanic Dabers server running on port",PORT)

})
