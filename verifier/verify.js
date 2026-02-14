const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended:true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const ABI=[
"function getProduct(string) view returns(string,string,string,string,string,string,uint256,address,address)"
];

const contract=new ethers.Contract(
process.env.CONTRACT_ADDRESS,
ABI,
provider
);

// ===== STYLE =====
const style=`
<style>
body{
background:#0b0f19;
color:white;
font-family:Inter;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
margin:0;
}
.card{
background:#121826;
padding:40px;
border-radius:20px;
width:420px;
box-shadow:0 0 50px rgba(0,255,200,0.15);
}
h1{
text-align:center;
color:#00ffd0;
margin-bottom:20px;
}
input{
width:100%;
padding:12px;
background:#0f1624;
border:none;
border-radius:10px;
color:white;
margin-top:10px;
}
button{
width:100%;
margin-top:20px;
padding:14px;
background:linear-gradient(90deg,#00ffd0,#00aaff);
border:none;
border-radius:10px;
font-weight:bold;
cursor:pointer;
}
.result{
margin-top:20px;
line-height:1.7;
}
.error{color:#ff5a5a}
</style>
`;

// ===== HOME =====
app.get("/",(req,res)=>{
res.send(`
${style}
<div class="card">
<h1>VERIFY PRODUCT</h1>
<form method="POST" action="/verify">
<input name="gpid" placeholder="Enter GPID" required/>
<button>Verify</button>
</form>
</div>
`);
});

// ===== VERIFY =====
app.post("/verify",async(req,res)=>{
try{

const data = await contract.getProduct(req.body.gpid);

res.send(`
${style}
<div class="card">
<h1>VERIFIED</h1>
<div class="result">
GPID: ${data[0]}<br>
Brand: ${data[1]}<br>
Model: ${data[2]}<br>
Category: ${data[3]}<br>
Factory: ${data[4]}<br>
Batch: ${data[5]}<br>
Born: ${new Date(Number(data[6])*1000).toUTCString()}<br>
Issuer: ${data[7]}<br>
Owner: ${data[8]}
</div>
<a href="/"><button>Verify Another</button></a>
</div>
`);

}catch{
res.send(`
${style}
<div class="card">
<h1>NOT FOUND</h1>
<div class="error">GPID not registered</div>
<a href="/"><button>Try Again</button></a>
</div>
`);
}
});

app.listen(PORT,()=>console.log("Verifier running"));