
let isAdmin=false

async function loadVideos(){

const res = await fetch("/api/videos")
const videos = await res.json()

const container = document.getElementById("videos")
container.innerHTML=""

videos.forEach(v=>{

const div = document.createElement("div")

div.innerHTML = `
<h3>${v.title}</h3>

<video controls src="/uploads/${v.file}" onplay="addView('${v._id}')"></video>

<p>${v.description}</p>

<p>👁 ${v.views}</p>

<button class="like" onclick="like('${v._id}',this)">👍 ${v.likes}</button>
<button class="dislike" onclick="dislike('${v._id}',this)">👎 ${v.dislikes}</button>

<div>
<input placeholder="comment" id="c${v._id}">
<button onclick="comment('${v._id}')">Send</button>
</div>

<div id="comments${v._id}">
${v.comments.map(c=>`<p><b>${c.user}</b>: ${c.text}</p>`).join("")}
</div>

${isAdmin ? `<button onclick="deleteVideo('${v._id}')">🗑 Delete</button>` : ""}
`

container.appendChild(div)

})

}

async function uploadVideo(){

const title=document.getElementById("title").value
const description=document.getElementById("desc").value
const file=document.getElementById("file").files[0]

const form = new FormData()

form.append("title",title)
form.append("description",description)
form.append("video",file)

await fetch("/api/upload",{method:"POST",body:form})

loadVideos()

}

async function addView(id){

if(localStorage.getItem("view_"+id)) return

await fetch("/api/view/"+id,{method:"POST"})

localStorage.setItem("view_"+id,true)

}

async function like(id,btn){

await fetch("/api/like/"+id,{method:"POST"})
btn.classList.add("active")

}

async function dislike(id,btn){

await fetch("/api/dislike/"+id,{method:"POST"})
btn.classList.add("active")

}

async function comment(id){

const text=document.getElementById("c"+id).value

await fetch("/api/comment/"+id,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({user:"Guest",text:text})
})

loadVideos()

}

async function deleteVideo(id){

if(!confirm("Delete video?")) return

await fetch("/api/video/"+id,{method:"DELETE"})

loadVideos()

}

function showTab(tab){

document.querySelectorAll("section").forEach(s=>s.style.display="none")

document.getElementById(tab).style.display="block"

}

function login(){

const u=document.getElementById("adminUser").value
const p=document.getElementById("adminPass").value

if(u==="Satanic_Dabers" && p==="Satanic432101"){

isAdmin=true
alert("Admin login")
loadVideos()

}

}

showTab("home")
loadVideos()
