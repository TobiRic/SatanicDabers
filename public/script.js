let isAdmin = false

/*
NAČTENÍ STRÁNKY
*/

window.onload = () => {

loadVideos()
showTab("home")

}

/*
TAB SYSTEM (5 záložek)
*/

function showTab(tab){

const tabs = document.querySelectorAll(".tab")
tabs.forEach(t => t.style.display = "none")

document.getElementById(tab).style.display = "block"

}

/*
ADMIN LOGIN
*/

async function login(){

const username = document.getElementById("user").value
const password = document.getElementById("pass").value

const res = await fetch("/api/login",{

method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
username,
password
})

})

if(res.ok){

isAdmin = true

alert("Admin přihlášen")

document.getElementById("adminPanel").style.display = "block"

}else{

alert("Špatné přihlášení")

}

}

/*
UPLOAD VIDEO
*/

async function uploadVideo(){

if(!isAdmin){

alert("Pouze admin může uploadovat video")
return

}

const file = document.getElementById("videoFile").files[0]
const title = document.getElementById("videoTitle").value

if(!file || !title){

alert("Vyplň název a vyber video")
return

}

const form = new FormData()

form.append("video",file)
form.append("title",title)

await fetch("/api/upload",{

method:"POST",
body:form

})

alert("Video nahráno")

loadVideos()

}

/*
NAČTENÍ VIDEÍ
*/

async function loadVideos(){

const res = await fetch("/api/videos")

const videos = await res.json()

const container = document.getElementById("videoList")

container.innerHTML = ""

videos.forEach(v => {

const div = document.createElement("div")

div.className = "videoCard"

div.innerHTML = `

<h3>${v.title}</h3>

<video 
controls 
width="100%" 
src="/uploads/${v.file}"
onplay="addView('${v._id}')"
></video>

<p>
👁 ${v.views} views
<br>
👍 ${v.likes} | 👎 ${v.dislikes}
</p>

<button onclick="likeVideo('${v._id}')">👍 Like</button>
<button onclick="dislikeVideo('${v._id}')">👎 Dislike</button>

${isAdmin ? `<button onclick="deleteVideo('${v._id}')">🗑 Delete</button>` : ""}

<h4>Komentáře</h4>

<input id="c${v._id}" placeholder="napiš komentář">

<button onclick="sendComment('${v._id}')">
Odeslat
</button>

<div class="comments">

${v.comments.map(c => `
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
VIEWS
*/

async function addView(id){

await fetch("/api/view/" + id,{
method:"POST"
})

}

/*
KOMENTÁŘ
*/

async function sendComment(id){

const input = document.getElementById("c"+id)

const text = input.value

if(!text){

alert("Napiš komentář")
return

}

await fetch("/api/comment/" + id,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

user:"guest",
text:text

})

})

input.value = ""

loadVideos()

}

/*
SMAZÁNÍ VIDEA
*/

async function deleteVideo(id){

if(!isAdmin){

alert("Pouze admin může mazat video")
return

}

if(!confirm("Opravdu chceš smazat video?")) return

await fetch("/api/video/" + id,{
method:"DELETE"
})

loadVideos()

}