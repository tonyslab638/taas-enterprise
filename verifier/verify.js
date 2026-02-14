import express from "express"
import dotenv from "dotenv"
import { ethers } from "ethers"

dotenv.config()

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const PORT = process.env.PORT || 10000

/* ================================
   ENV SAFE LOAD
================================ */

const RPC = process.env.RPC || ""
const CONTRACT = process.env.CONTRACT || ""

if (!RPC || !CONTRACT) {
  console.log("❌ Missing ENV variables")
  console.log("RPC:", RPC ? "OK" : "MISSING")
  console.log("CONTRACT:", CONTRACT ? "OK" : "MISSING")
}

/* ================================
   BLOCKCHAIN CONNECTION
================================ */

let contract = null

try {
  const provider = new ethers.JsonRpcProvider(RPC)

  const ABI = [
    "function getProduct(string) view returns(string,string,string,string,string,string,uint256,address,address)"
  ]

  contract = new ethers.Contract(CONTRACT, ABI, provider)

  console.log("===================================")
  console.log("TAAS VERIFIER V3 LIVE")
  console.log("RPC:", RPC)
  console.log("Contract:", CONTRACT)
  console.log("===================================")

} catch (err) {
  console.log("Blockchain connection failed:", err.message)
}

/* ================================
   UI PAGE
================================ */

function page(content){
return `
<!DOCTYPE html>
<html>
<head>
<title>ASJUJ Network Verifier</title>
<meta name="viewport" content="width=device-width,initial-scale=1">

<style>

body{
background: radial-gradient(circle at top,#0f172a,#020617);
font-family: system-ui;
color:white;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
margin:0;
}

.card{
width:420px;
background:#020617cc;
backdrop-filter: blur(25px);
border:1px solid #1e293b;
padding:35px;
border-radius:18px;
box-shadow:0 0 60px #000;
}

h1{
text-align:center;
margin-bottom:20px;
background:linear-gradient(90deg,#22d3ee,#a78bfa);
-webkit-background-clip:text;
color:transparent;
}

input{
width:100%;
padding:14px;
border-radius:10px;
border:1px solid #334155;
background:#020617;
color:white;
margin-bottom:15px;
}

button{
width:100%;
padding:14px;
border:none;
border-radius:10px;
background:linear-gradient(90deg,#22d3ee,#6366f1);
color:white;
font-weight:bold;
cursor:pointer;
}

button:hover{
opacity:.9;
}

.result{
margin-top:20px;
padding:18px;
background:#020617;
border:1px solid #334155;
border-radius:12px;
}

.label{
color:#94a3b8;
font-size:13px;
}

.value{
font-size:15px;
margin-bottom:10px;
word-wrap:break-word;
}

.error{
color:#f87171;
text-align:center;
margin-top:10px;
}

.success{
color:#4ade80;
text-align:center;
margin-bottom:10px;
}

</style>
</head>
<body>
<div class="card">

<h1>ASJUJ VERIFY</h1>

<form method="POST" action="/verify">
<input name="gpid" placeholder="Enter GPID or Scan QR" required />
<button>Verify Product</button>
</form>

${content}

</div>
</body>
</html>
`
}

/* ================================
   HOME
================================ */

app.get("/", (req,res)=>{
res.send(page(""))
})

/* ================================
   VERIFY
================================ */

app.post("/verify", async (req,res)=>{

try{

if(!contract)
return res.send(page(`<div class="error">Blockchain not connected</div>`))

let { gpid } = req.body

if(!gpid)
return res.send(page(`<div class="error">Missing GPID</div>`))

gpid = gpid.trim()

const p = await contract.getProduct(gpid)

res.send(page(`
<div class="success">✔ ASJUJ Verified Product</div>

<div class="result">

<div class="label">GPID</div>
<div class="value">${p[0]}</div>

<div class="label">Brand</div>
<div class="value">${p[1]}</div>

<div class="label">Model</div>
<div class="value">${p[2]}</div>

<div class="label">Category</div>
<div class="value">${p[3]}</div>

<div class="label">Factory</div>
<div class="value">${p[4]}</div>

<div class="label">Batch</div>
<div class="value">${p[5]}</div>

<div class="label">Born</div>
<div class="value">${new Date(Number(p[6])*1000).toUTCString()}</div>

<div class="label">Issuer</div>
<div class="value">${p[7]}</div>

<div class="label">Owner</div>
<div class="value">${p[8]}</div>

</div>
`))

}catch(err){

res.send(page(`
<div class="error">
Product Not Found<br><br>
This GPID is not registered on ASJUJ Network
</div>
`))

}

})

/* ================================
   START SERVER
================================ */

app.listen(PORT,()=>{
console.log("Verifier running on",PORT)
})