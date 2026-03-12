let isAdmin = false

/*
LOGIN
*/

async function login(){

const username = document.getElementById("user").value
const password = document.getElementById("pass").value

const res = await fetch("/api/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({username,password})
})

if(res.ok){

isAdmin = true
alert("Admin přihlášen")
loadVideos()

}else{

alert("Špatné přihlášení")

}

}

/*
LOAD VIDEOS
*/

async function loadVideos(){

const res = await fetch("/api/videos")
const videos = await res.json()

const container = document.getElementById("content")

container.innerHTML = ""

videos.forEach(v=>{

const div = document.createElement("div")
div.className = "video"

div.innerHTML = `

<h3>${v.title}</h3>

<video controls onplay="addView('${v._id}')" src="/uploads/${v.file}"></video>

<p>
👁 ${v.views} |
👍 ${v.likes} |
👎 ${v.dislikes}
</p>

<button onclick="likeVideo('${v._id}')">👍 Like</button>
<button onclick="dislikeVideo('${v._id}')">👎 Dislike</button>

${isAdmin ? `<button onclick="deleteVideo('${v._id}')">🗑 Delete</button>` : ""}

<br><br>

<input id="c${v._id}" placeholder="comment">
<button onclick="sendComment('${v._id}')">Send</button>

<div>

${v.comments.map(c=>`
<div class="comment">
<b>${c.user}</b>: ${c.text}
</div>
`).join("")}

</div>

`

container.appendChild(div)

})

}

/*
LIKE
*/

async function likeVideo(id){

await fetch("/api/like/" + id,{
method:"POST"
})

loadVideos()

}

/*
DISLIKE
*/

async function dislikeVideo(id){

await fetch("/api/dislike/" + id,{
method:"POST"
})

loadVideos()

}

/*
VIEW
*/

async function addView(id){

await fetch("/api/view/" + id,{
method:"POST"
})

}

/*
COMMENT
*/

async function sendComment(id){

const input = document.getElementById("c"+id)
const text = input.value

if(!text) return

await fetch("/api/comment/" + id,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
user:"guest",
text
})
})

input.value = ""

loadVideos()

}

/*
DELETE VIDEO
*/

async function deleteVideo(id){

if(!confirm("Opravdu chceš smazat video?")) return

await fetch("/api/video/" + id,{
method:"DELETE"
})

loadVideos()

}

/*
UPLOAD VIDEO
*/

async function uploadVideo(){

const file = document.getElementById("file").files[0]
const title = document.getElementById("title").value

const form = new FormData()

form.append("video",file)
form.append("title",title)

await fetch("/api/upload",{
method:"POST",
body:form
})

loadVideos()

}

/*
AUTO LOAD
*/

loadVideos()
