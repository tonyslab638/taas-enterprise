import express from "express";
import { ethers } from "ethers";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const CONTRACT = process.env.CONTRACT;
const RPC = process.env.RPC;

const provider = new ethers.JsonRpcProvider(RPC);

const abi = [
  "function getProduct(string memory) view returns(string,string,string,string,string,string,uint256,address,address)"
];

const contract = new ethers.Contract(CONTRACT, abi, provider);

/* ================= UI PAGE ================= */

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>ASJUJ Network Verifier</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />

<script src="https://unpkg.com/html5-qrcode"></script>

<style>

body{
margin:0;
font-family:Segoe UI, sans-serif;
background:linear-gradient(135deg,#020617,#0f172a,#020617);
color:white;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
}

.card{
width:420px;
background:rgba(15,23,42,.85);
padding:30px;
border-radius:20px;
box-shadow:0 0 40px rgba(0,255,255,.15);
text-align:center;
backdrop-filter:blur(10px);
}

h1{
margin-bottom:10px;
color:#22d3ee;
letter-spacing:2px;
}

input{
width:100%;
padding:14px;
border-radius:12px;
border:none;
margin-top:15px;
font-size:16px;
background:#020617;
color:white;
outline:none;
text-align:center;
}

button{
width:100%;
padding:14px;
margin-top:15px;
border:none;
border-radius:12px;
background:linear-gradient(90deg,#22d3ee,#818cf8);
font-weight:bold;
font-size:16px;
cursor:pointer;
color:black;
transition:.25s;
}

button:hover{
transform:scale(1.05);
}

#reader{
margin-top:20px;
}

.result{
margin-top:20px;
padding:15px;
border-radius:14px;
background:#020617;
text-align:left;
font-size:14px;
line-height:1.6;
}

.ok{
border:1px solid #22c55e;
}

.err{
border:1px solid #ef4444;
}

</style>
</head>

<body>

<div class="card">

<h1>ASJUJ VERIFY</h1>

<form method="POST" action="/verify">
<input name="gpid" placeholder="Enter GPID" required/>
<button>VERIFY PRODUCT</button>
</form>

<button onclick="startScanner()">SCAN QR</button>

<div id="reader"></div>

</div>

<script>

function extractGPID(text){

let gpid=text.trim();

if(gpid.includes("/verify/"))
gpid=gpid.split("/verify/")[1];

if(gpid.includes("?"))
gpid=gpid.split("?")[0];

if(gpid.endsWith("/"))
gpid=gpid.slice(0,-1);

return gpid;
}

function startScanner(){

const reader = new Html5Qrcode("reader");

reader.start(
{ facingMode:"environment" },
{ fps:10, qrbox:250 },
(decoded)=>{

let gpid=extractGPID(decoded);

window.location="/verify/"+gpid;

reader.stop();
},
(err)=>{}
);

}

</script>

</body>
</html>
`);
});

/* ================= VERIFY POST ================= */

app.post("/verify", async (req,res)=>{
res.redirect("/verify/"+req.body.gpid);
});

/* ================= VERIFY PAGE ================= */

app.get("/verify/:gpid", async (req,res)=>{

const gpid=req.params.gpid;

try{

const p=await contract.getProduct(gpid);

res.send(`
<body style="
background:#020617;
font-family:Segoe UI;
color:white;
display:flex;
justify-content:center;
align-items:center;
height:100vh">

<div style="
background:#0f172a;
padding:35px;
border-radius:20px;
width:420px;
box-shadow:0 0 40px rgba(0,255,255,.2)">

<h2 style="color:#22d3ee;text-align:center">✓ ASJUJ Verified Product</h2>

<p><b>GPID:</b> ${p[0]}</p>
<p><b>Brand:</b> ${p[1]}</p>
<p><b>Model:</b> ${p[2]}</p>
<p><b>Category:</b> ${p[3]}</p>
<p><b>Factory:</b> ${p[4]}</p>
<p><b>Batch:</b> ${p[5]}</p>
<p><b>Born:</b> ${new Date(Number(p[6])*1000).toUTCString()}</p>
<p><b>Issuer:</b> ${p[7]}</p>
<p><b>Owner:</b> ${p[8]}</p>

<br>

<a href="/" style="
display:block;
text-align:center;
padding:12px;
border-radius:12px;
background:linear-gradient(90deg,#22d3ee,#818cf8);
color:black;
font-weight:bold;
text-decoration:none">Verify Another</a>

</div>
</body>
`);

}catch{

res.send(`
<body style="
background:#020617;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
font-family:Segoe UI;
color:white">

<div style="
background:#0f172a;
padding:35px;
border-radius:20px;
width:420px;
text-align:center;
box-shadow:0 0 40px rgba(255,0,0,.25)">

<h2 style="color:#ef4444">❌ Product Not Found</h2>
<p>This GPID is not registered on ASJUJ Network.</p>

<br>

<a href="/" style="
display:block;
padding:12px;
border-radius:12px;
background:#ef4444;
color:white;
font-weight:bold;
text-decoration:none">Try Again</a>

</div>
</body>
`);
}

});

/* ================= START SERVER ================= */

const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log("Verifier running on",PORT));