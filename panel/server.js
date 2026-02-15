import express from "express"
import { ethers } from "ethers"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended:true }))

/* =======================================================
   ENV CHECK
======================================================= */

const RPC = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const CORE = process.env.CONTRACT_ADDRESS
const HISTORY = process.env.HISTORY_ADDRESS

if(!RPC || !PRIVATE_KEY || !CORE){
    console.log("❌ Missing ENV variables")
    console.log("RPC:",RPC? "OK":"MISSING")
    console.log("KEY:",PRIVATE_KEY? "OK":"MISSING")
    console.log("CORE:",CORE? "OK":"MISSING")
    process.exit(1)
}

/* =======================================================
   PROVIDER + WALLET
======================================================= */

const provider = new ethers.JsonRpcProvider(RPC)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

/* =======================================================
   CONTRACTS
======================================================= */

const coreContract = new ethers.Contract(
    CORE,
    [
        "function createProduct(string,string,string,string,string,string)",
        "function transferOwnership(string,address)",
        "function getProduct(string) view returns(string,string,string,string,string,string,uint256,address,address)"
    ],
    wallet
)

let historyContract = null

if(HISTORY){
    historyContract = new ethers.Contract(
        HISTORY,
        [
            "function record(string,address,address)",
            "function getHistory(string) view returns(tuple(address from,address to,uint256 time)[])"
        ],
        wallet
    )
}

/* =======================================================
   UI PAGE
======================================================= */

app.get("/", (req,res)=>{
res.send(`
<html>
<head>
<title>ASJUJ Control Panel</title>
<style>
body{
font-family:Arial;
background:#0a0f1c;
color:white;
text-align:center;
padding-top:40px;
}
input{
padding:12px;
margin:8px;
width:260px;
border-radius:10px;
border:none;
}
button{
padding:12px 22px;
margin:10px;
border:none;
border-radius:12px;
background:#00ffd5;
font-weight:bold;
cursor:pointer;
}
.card{
background:#121a2c;
padding:25px;
border-radius:20px;
width:420px;
margin:auto;
box-shadow:0 0 40px #00ffd520;
}
</style>
</head>

<body>

<div class="card">

<h2>ASJUJ Control Panel</h2>

<input id="gpid" placeholder="GPID"><br>
<input id="brand" placeholder="Brand"><br>
<input id="model" placeholder="Model"><br>
<input id="category" placeholder="Category"><br>
<input id="factory" placeholder="Factory"><br>
<input id="batch" placeholder="Batch"><br>
<input id="newOwner" placeholder="Transfer Address"><br>

<button onclick="create()">Create Product</button>
<button onclick="transfer()">Transfer Ownership</button>
<button onclick="history()">View History</button>

<p id="msg"></p>

</div>

<script>

async function create(){
const res = await fetch("/create",{method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({
gpid:gpid.value,
brand:brand.value,
model:model.value,
category:category.value,
factory:factory.value,
batch:batch.value
})})
msg.innerText = await res.text()
}

async function transfer(){
const res = await fetch("/transfer",{method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({
gpid:gpid.value,
newOwner:newOwner.value
})})
msg.innerText = await res.text()
}

function history(){
window.open("/history/"+gpid.value,"_blank")
}

</script>
</body>
</html>
`)
})

/* =======================================================
   CREATE PRODUCT
======================================================= */

app.post("/create", async(req,res)=>{
try{

const {gpid,brand,model,category,factory,batch} = req.body

const tx = await coreContract.createProduct(
gpid,brand,model,category,factory,batch
)

await tx.wait()

res.send("✔ Product Created")

}catch(err){
res.send("❌ "+err.reason || err.message)
}
})

/* =======================================================
   TRANSFER OWNERSHIP
======================================================= */

app.post("/transfer", async(req,res)=>{
try{

const {gpid,newOwner} = req.body

const product = await coreContract.getProduct(gpid)
const oldOwner = product[8]

const tx = await coreContract.transferOwnership(gpid,newOwner)
await tx.wait()

if(historyContract){
await historyContract.record(gpid, oldOwner, newOwner)
}

res.send("✔ Ownership Transferred")

}catch(err){
res.send("❌ "+(err.reason||err.message))
}
})

/* =======================================================
   HISTORY VIEW
======================================================= */

app.get("/history/:gpid", async(req,res)=>{
try{

if(!historyContract) return res.send("History not deployed")

const data = await historyContract.getHistory(req.params.gpid)

res.json(data)

}catch(err){
res.send(err.message)
}
})

/* =======================================================
   START SERVER
======================================================= */

app.listen(10000,()=>{
console.log("===================================")
console.log("🚀 TAAS PANEL LIVE")
console.log("Wallet:",wallet.address)
console.log("Core:",CORE)
console.log("History:",HISTORY||"Not connected")
console.log("===================================")
})