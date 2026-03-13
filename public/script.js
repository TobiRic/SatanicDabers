
let isAdmin=false

async function loadTabs(){

const res = await fetch("/api/tabs")
const tabs = await res.json()

const nav=document.getElementById("nav")
nav.innerHTML=""

tabs.forEach((t,i)=>{
const ids=["home","videos","upload","community","admin"]
const b=document.createElement("button")
b.innerText=t
b.onclick=()=>showTab(ids[i])
nav.appendChild(b)
})

document.getElementById("upload").style.display="none"

}

async function loadPage(name){

const res=await fetch("/api/page/"+name)
const page=await res.json()
document.getElementById(name).innerHTML=page.content

}

async function savePage(name,input){

const content=document.getElementById(input).value

await fetch("/api/page/"+name,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({content})
})

loadPage(name)

}

async function saveTabs(){

const tabs=[
tab0.value,
tab1.value,
tab2.value,
tab3.value,
tab4.value
]

await fetch("/api/tabs",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({tabs})
})

loadTabs()

}

async function loadVideos(){

const res = await fetch("/api/videos")
const videos = await res.json()

const container = document.getElementById("videos")
container.innerHTML=""

videos.forEach(v=>{

const div=document.createElement("div")

div.innerHTML=`
<h3>${v.title}</h3>

<video controls src="/uploads/${v.file}" onplay="addView('${v._id}')"></video>

<p>${v.description}</p>

<p>👁 ${v.views}</p>

<button class="like" onclick="like('${v._id}',this)">👍 ${v.likes}</button>
<button class="dislike" onclick="dislike('${v._id}',this)">👎 ${v.dislikes}</button>

<input id="c${v._id}" placeholder="comment">
<button onclick="comment('${v._id}')">Send</button>

${isAdmin?`<button onclick="deleteVideo('${v._id}')">Delete</button>`:""}
`

container.appendChild(div)

})

}

async function uploadVideo(){

const title=title.value
const description=desc.value
const file=document.getElementById("file").files[0]

const form=new FormData()
form.append("title",title)
form.append("description",description)
form.append("video",file)

await fetch("/api/upload",{method:"POST",body:form})

loadVideos()

}

async function addView(id){
if(localStorage.getItem("view_"+id))return
await fetch("/api/view/"+id,{method:"POST"})
localStorage.setItem("view_"+id,true)
}

async function like(id,b){
await fetch("/api/like/"+id,{method:"POST"})
b.classList.add("active")
}

async function dislike(id,b){
await fetch("/api/dislike/"+id,{method:"POST"})
b.classList.add("active")
}

async function comment(id){

const text=document.getElementById("c"+id).value

await fetch("/api/comment/"+id,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({user:"Guest",text})
})

loadVideos()

}

async function deleteVideo(id){

await fetch("/api/video/"+id,{method:"DELETE"})
loadVideos()

}

function showTab(id){

document.querySelectorAll("section").forEach(s=>s.style.display="none")
document.getElementById(id).style.display="block"

if(id==="upload" && !isAdmin){
alert("Admin only")
showTab("home")
}

}

function login(){

const u=adminUser.value
const p=adminPass.value

if(u==="Satanic_Dabers" && p==="Satanic432101"){

isAdmin=true

document.getElementById("adminPanel").style.display="block"
document.getElementById("upload").style.display="block"

alert("Admin login")

}

}

loadTabs()
loadVideos()
loadPage("home")
loadPage("community")
