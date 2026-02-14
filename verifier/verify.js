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


// PAGE TEMPLATE
function page(content){
return `
<html>
<head>
<title>ASJUJ Verify</title>

<script src="https://unpkg.com/html5-qrcode"></script>

<style>

body{
margin:0;
font-family:Segoe UI;
background:black;
color:white;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
}

.card{
background:#0b0b0b;
padding:50px;
border-radius:20px;
width:420px;
text-align:center;
box-shadow:0 0 60px rgba(0,255,255,.15);
}

.title{
font-size:28px;
margin-bottom:25px;
}

input{
width:100%;
padding:14px;
border-radius:10px;
border:none;
margin-bottom:15px;
background:#111;
color:white;
}

button{
width:100%;
padding:14px;
border:none;
border-radius:12px;
background:linear-gradient(45deg,#00f0ff,#00ffa6);
font-weight:bold;
cursor:pointer;
margin-top:10px;
}

button:hover{
transform:scale(1.05);
}

.scan{
background:#151515;
margin-top:15px;
}

.label{color:#9ae6ff;margin-top:10px;font-size:14px;}
.value{margin-bottom:10px;font-weight:600;word-break:break-word;}
.success{color:#00ffa6;font-size:22px;margin-bottom:15px;}
.error{color:#ff5e7a;font-size:22px;margin-bottom:15px;}

#reader{
margin-top:15px;
}

</style>
</head>
<body>
${content}
</body>
</html>
`;
}



// HOME PAGE
app.get("/", (req,res)=>{
res.send(page(`
<div class="card">

<div class="title">ASJUJ VERIFY</div>

<form action="/verify">
<input id="gpid" name="gpid" placeholder="Enter GPID"/>
<button>Verify Product</button>
</form>

<button class="scan" onclick="startScanner()">📷 Scan QR</button>

<div id="reader"></div>

<script>
function startScanner(){
const qr=new Html5Qrcode("reader");
qr.start(
{ facingMode:"environment" },
{ fps:10, qrbox:250 },
code=>{
document.getElementById("gpid").value=code;
qr.stop();
}
);
}
</script>

</div>
`));
});



// VERIFY PAGE
app.get("/verify", async(req,res)=>{

try{
const gpid=req.query.gpid;
const p=await contract.getProduct(gpid);

res.send(page(`
<div class="card">

<div class="success">✔ AUTHENTIC PRODUCT</div>

<div class="label">GPID</div><div class="value">${p[0]}</div>
<div class="label">Brand</div><div class="value">${p[1]}</div>
<div class="label">Model</div><div class="value">${p[2]}</div>
<div class="label">Category</div><div class="value">${p[3]}</div>
<div class="label">Factory</div><div class="value">${p[4]}</div>
<div class="label">Batch</div><div class="value">${p[5]}</div>
<div class="label">Born</div><div class="value">${new Date(Number(p[6])*1000).toUTCString()}</div>
<div class="label">Issuer</div><div class="value">${p[7]}</div>
<div class="label">Owner</div><div class="value">${p[8]}</div>

<br>
<a href="/" style="color:cyan">Verify Another</a>

</div>
`));

}catch{

res.send(page(`
<div class="card">

<div class="error">❌ PRODUCT NOT FOUND</div>
<div>This GPID is not registered on ASJUJ Network</div>

<br><br>
<a href="/" style="color:cyan">Try Again</a>

</div>
`));

}

});


app.listen(PORT,()=>console.log("Verifier running on",PORT));