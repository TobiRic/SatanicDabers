
let token=null

async function login(){
let r=await fetch("/api/login",{method:"POST",headers:{'Content-Type':'application/json'},
body:JSON.stringify({username:user.value,password:pass.value})})
if(r.ok){
let d=await r.json()
token=d.token
panel.style.display="block"
}
}

function showAdmin(){
admin.style.display="block"
videos.style.display="none"
}

async function upload(){
let form=new FormData()
form.append("video",file.files[0])
form.append("title",title.value)
await fetch("/api/upload",{method:"POST",headers:{Authorization:token},body:form})
loadVideos()
}

async function loadVideos(){
videos.style.display="block"
admin.style.display="none"

let r=await fetch("/api/videos")
let data=await r.json()

videos.innerHTML=""
data.forEach(v=>{

let div=document.createElement("div")
div.className="video-card"

div.innerHTML=`
<h3>${v.title}</h3>
<video controls src="${v.url}"></video>
<p>👍 ${v.likes} 👎 ${v.dislikes}</p>
<button onclick="like('${v._id}')">Like</button>
<button onclick="dislike('${v._id}')">Dislike</button>

<input placeholder="comment" id="c${v._id}">
<button onclick="comment('${v._id}')">Send</button>

<div>
${v.comments.map(c=>"<div class='comment'>"+c.user+": "+c.text+"</div>").join("")}
</div>
`
videos.appendChild(div)

})
}

async function like(id){
await fetch("/api/like/"+id,{method:"POST"})
loadVideos()
}

async function dislike(id){
await fetch("/api/dislike/"+id,{method:"POST"})
loadVideos()
}

async function comment(id){
let text=document.getElementById("c"+id).value
await fetch("/api/comment/"+id,{method:"POST",headers:{'Content-Type':'application/json'},
body:JSON.stringify({user:"guest",text})})
loadVideos()
}

loadVideos()
