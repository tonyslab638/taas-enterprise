import express from "express"
import dotenv from "dotenv"
import { ethers } from "ethers"
import bodyParser from "body-parser"

dotenv.config()

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:true }))

/* ===============================
   ENV VALIDATION
=================================*/

const RPC = process.env.RPC_URL
const PRIVATE = process.env.PRIVATE_KEY
const CORE = process.env.CONTRACT_ADDRESS
const OWNERSHIP = process.env.OWNERSHIP_ADDRESS

if(!RPC || !PRIVATE || !CORE || !OWNERSHIP){
 console.log("❌ Missing ENV variables")
 console.log("RPC:",RPC?"OK":"MISSING")
 console.log("PRIVATE:",PRIVATE?"OK":"MISSING")
 console.log("CORE:",CORE?"OK":"MISSING")
 console.log("OWNERSHIP:",OWNERSHIP?"OK":"MISSING")
 process.exit(1)
}

/* ===============================
   PROVIDER + WALLET
=================================*/

const provider = new ethers.JsonRpcProvider(RPC)
const wallet = new ethers.Wallet(PRIVATE,provider)

/* ===============================
   CORE CONTRACT
=================================*/

const coreABI = [
 "function createProduct(string,string,string,string,string,string)",
 "function getProduct(string) view returns(string,string,string,string,string,string,uint256,address,address)"
]

const core = new ethers.Contract(CORE,coreABI,wallet)

/* ===============================
   OWNERSHIP CONTRACT
=================================*/

const ownershipABI = [
 "function transferProduct(string,address)",
 "function ownerOf(string) view returns(address)"
]

const ownership = new ethers.Contract(
 OWNERSHIP,
 ownershipABI,
 wallet
)

/* ===============================
   UI PAGE
=================================*/

app.get("/",(req,res)=>{
res.send(`
<html>
<head>
<title>TAAS PANEL V3</title>
<style>
body{
 background:#0f172a;
 color:white;
 font-family:system-ui;
 text-align:center;
 padding-top:40px
}
.card{
 background:#111827;
 padding:30px;
 border-radius:20px;
 width:420px;
 margin:auto;
 box-shadow:0 0 40px rgba(0,255,255,.15)
}
input{
 width:100%;
 margin:6px 0;
 padding:12px;
 border-radius:10px;
 border:none;
 background:#1f2937;
 color:white
}
button{
 width:100%;
 margin-top:12px;
 padding:14px;
 border:none;
 border-radius:12px;
 background:linear-gradient(90deg,#06b6d4,#3b82f6);
 color:white;
 font-weight:bold;
 cursor:pointer
}
button:hover{
 transform:scale(1.03)
}
</style>
</head>
<body>

<div class="card">
<h2>ASJUJ Control Panel</h2>

<input id="gpid" placeholder="GPID">
<input id="brand" placeholder="Brand">
<input id="model" placeholder="Model">
<input id="category" placeholder="Category">
<input id="factory" placeholder="Factory">
<input id="batch" placeholder="Batch">

<button onclick="create()">Create Product</button>
<button onclick="transfer()">Transfer Ownership</button>

<p id="msg"></p>
</div>

<script>

async function create(){
const data={
 gpid:gpid.value,
 brand:brand.value,
 model:model.value,
 category:category.value,
 factory:factory.value,
 batch:batch.value
}

const r=await fetch("/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
msg.innerText=await r.text()
}

async function transfer(){
const gpidVal=prompt("Enter GPID")
const to=prompt("Enter New Owner Address")

const r=await fetch("/transfer",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({gpid:gpidVal,to})})
msg.innerText=await r.text()
}

</script>

</body>
</html>
`)
})

/* ===============================
   CREATE PRODUCT
=================================*/

app.post("/create", async(req,res)=>{
try{
 const {gpid,brand,model,category,factory,batch}=req.body

 const tx=await core.createProduct(
  gpid,brand,model,category,factory,batch
 )

 await tx.wait()

 res.send("✔ Product Created")
}catch(err){
 res.send(err.reason||err.message)
}
})

/* ===============================
   TRANSFER OWNERSHIP
=================================*/

app.post("/transfer", async(req,res)=>{
try{
 const {gpid,to}=req.body

 const tx=await ownership.transferProduct(gpid,to)
 await tx.wait()

 res.send("✔ Ownership Transferred")
}catch(err){
 res.send(err.reason||err.message)
}
})

/* ===============================
   SERVER START
=================================*/

app.listen(10000,()=>{
console.log("================================")
console.log("TAAS PANEL V3 RUNNING")
console.log("Wallet:",wallet.address)
console.log("Core:",CORE)
console.log("Ownership:",OWNERSHIP)
console.log("================================")
})