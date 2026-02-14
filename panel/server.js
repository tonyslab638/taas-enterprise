const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ===== CONFIG =====
const RPC = process.env.SEPOLIA_RPC_URL;
const KEY = process.env.PRIVATE_KEY;
const CONTRACT = process.env.CONTRACT_ADDRESS;

// ===== PROVIDER =====
const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(KEY, provider);

// ===== CONTRACT ABI =====
const ABI = [
"function createProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(CONTRACT, ABI, wallet);

// ===== UI STYLE =====
const style = `
<style>
body{
background:#0b0f19;
color:white;
font-family:Inter, sans-serif;
display:flex;
align-items:center;
justify-content:center;
height:100vh;
margin:0;
}
.card{
background:#121826;
padding:40px;
border-radius:18px;
box-shadow:0 0 40px rgba(0,255,200,0.15);
width:420px;
}
h1{
margin-bottom:20px;
color:#00ffd0;
text-align:center;
}
input{
width:100%;
padding:12px;
margin-top:10px;
background:#0f1624;
border:none;
border-radius:8px;
color:white;
}
button{
width:100%;
margin-top:20px;
padding:14px;
border:none;
border-radius:10px;
background:linear-gradient(90deg,#00ffd0,#00aaff);
font-weight:bold;
cursor:pointer;
}
button:hover{
opacity:.9;
}
.success{
color:#00ffa6;
text-align:center;
margin-top:20px;
}
.error{
color:#ff5a5a;
text-align:center;
margin-top:20px;
}
</style>
`;

// ===== FORM PAGE =====
app.get("/", (req,res)=>{
res.send(`
${style}
<div class="card">
<h1>ASJUJ PANEL</h1>
<form method="POST" action="/create">
<input name="gpid" placeholder="GPID" required/>
<input name="brand" placeholder="Brand" required/>
<input name="model" placeholder="Model" required/>
<input name="category" placeholder="Category" required/>
<input name="factory" placeholder="Factory" required/>
<input name="batch" placeholder="Batch" required/>
<button>Create Product</button>
</form>
</div>
`);
});

// ===== CREATE PRODUCT =====
app.post("/create", async (req,res)=>{
try{

const {gpid,brand,model,category,factory,batch} = req.body;

const tx = await contract.createProduct(
gpid,brand,model,category,factory,batch,
{ gasLimit: 300000 }
);

await tx.wait();

res.send(`
${style}
<div class="card">
<h1>SUCCESS</h1>
<div class="success">
GPID: ${gpid}<br><br>
TX: ${tx.hash}
</div>
<a href="/"><button>Create Another</button></a>
</div>
`);

}catch(err){
res.send(`
${style}
<div class="card">
<h1>ERROR</h1>
<div class="error">${err.reason || err.message}</div>
<a href="/"><button>Back</button></a>
</div>
`);
}
});

app.listen(PORT,()=>console.log("Panel running"));