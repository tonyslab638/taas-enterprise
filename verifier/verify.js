import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  [
    "function getProduct(string) view returns(string,string,string,string,string,string,uint256,address,address)"
  ],
  provider
);


// ================= PAGE TEMPLATE =================
function page(content){
return `
<html>
<head>
<title>ASJUJ Verify</title>

<style>

body{
margin:0;
font-family: 'Segoe UI', sans-serif;
background: radial-gradient(circle at top,#0a0a0a,#000);
color:white;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
overflow:hidden;
}

/* holographic floating particles */
body::before{
content:"";
position:absolute;
width:200%;
height:200%;
background:
radial-gradient(circle,rgba(0,255,255,.15) 1px,transparent 1px);
background-size:40px 40px;
animation:move 40s linear infinite;
}

@keyframes move{
from{transform:translate(0,0)}
to{transform:translate(-200px,-200px)}
}


.card{
position:relative;
background: rgba(255,255,255,0.04);
border:1px solid rgba(255,255,255,0.15);
backdrop-filter: blur(25px);
padding:55px;
border-radius:28px;
width:430px;
text-align:center;
box-shadow:0 0 80px rgba(0,255,255,0.08);
z-index:2;
animation:fade 1s ease;
}

@keyframes fade{
from{opacity:0; transform:translateY(30px)}
to{opacity:1; transform:translateY(0)}
}

.title{
font-size:30px;
font-weight:700;
margin-bottom:35px;
letter-spacing:2px;
}


/* holographic badge */
.badge{
width:120px;
height:120px;
margin:auto;
border-radius:50%;
background:
conic-gradient(
cyan,
magenta,
cyan,
lime,
cyan
);
display:flex;
align-items:center;
justify-content:center;
animation:spin 6s linear infinite;
box-shadow:0 0 50px cyan;
margin-bottom:25px;
}

.badge-inner{
width:90px;
height:90px;
background:#000;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:40px;
font-weight:900;
color:#00ffe5;
text-shadow:0 0 15px cyan;
}

@keyframes spin{
from{transform:rotate(0)}
to{transform:rotate(360deg)}
}


input{
width:100%;
padding:15px;
border-radius:12px;
border:none;
outline:none;
font-size:16px;
margin-bottom:20px;
background:#0f0f0f;
color:white;
}

button{
width:100%;
padding:15px;
border:none;
border-radius:14px;
background:linear-gradient(45deg,#00f0ff,#00ffa6);
font-weight:700;
font-size:16px;
cursor:pointer;
transition:.3s;
}

button:hover{
transform:scale(1.06);
box-shadow:0 0 25px cyan;
}

.label{
color:#9ae6ff;
margin-top:10px;
font-size:14px;
}

.value{
margin-bottom:10px;
font-weight:600;
word-break:break-word;
}

.success{
color:#00ffa6;
font-size:24px;
margin-bottom:20px;
}

.error{
color:#ff5e7a;
font-size:24px;
margin-bottom:20px;
}

a{
color:#00f0ff;
text-decoration:none;
font-weight:600;
}

</style>
</head>
<body>
${content}
</body>
</html>
`;
}



// ================= HOME =================
app.get("/", (req,res)=>{
res.send(page(`
<div class="card">

<div class="title">ASJUJ VERIFY</div>

<form action="/verify">
<input name="gpid" placeholder="Enter Product GPID"/>
<button>Verify Authenticity</button>
</form>

</div>
`));
});




// ================= VERIFY =================
app.get("/verify", async(req,res)=>{

try{

const gpid=req.query.gpid;
const p=await contract.getProduct(gpid);

res.send(page(`
<div class="card">

<div class="badge">
<div class="badge-inner">✓</div>
</div>

<div class="success">AUTHENTIC PRODUCT</div>

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

<br>
<a href="/">Verify Another</a>

</div>
`));

}catch{

res.send(page(`
<div class="card">

<div class="error">PRODUCT NOT FOUND</div>

<div style="opacity:.7">
This GPID is not registered on ASJUJ Network
</div>

<br><br>
<a href="/">Try Again</a>

</div>
`));

}

});


app.listen(PORT,()=>console.log("Verifier running on",PORT));