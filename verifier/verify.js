import express from "express";
import { ethers } from "ethers";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ================= ENV =================

const RPC = process.env.RPC_URL;
const CONTRACT = process.env.CONTRACT_ADDRESS;

if (!RPC || !CONTRACT) {
  console.log("❌ Missing ENV variables");
  console.log("RPC:", RPC || "MISSING");
  console.log("CONTRACT:", CONTRACT || "MISSING");
}

console.log("===================================");
console.log("TAAS VERIFIER V3 LIVE");
console.log("RPC:", RPC);
console.log("Contract:", CONTRACT);
console.log("===================================");

// ================= BLOCKCHAIN =================

const provider = new ethers.JsonRpcProvider(RPC);

const contract = new ethers.Contract(
  CONTRACT,
  [
    "function getProduct(string) view returns(string,string,string,string,string,string,uint256,address,address)"
  ],
  provider
);

// ================= UI PAGE =================

function page(content) {
  return `
  <html>
  <head>
  <title>ASJUJ Verifier</title>
  <style>
  body{
    font-family: Arial;
    background:#0f172a;
    color:white;
    text-align:center;
    padding:40px;
  }
  input{
    padding:12px;
    width:260px;
    border-radius:10px;
    border:none;
    margin-top:10px;
  }
  button{
    padding:12px 30px;
    margin-top:15px;
    border:none;
    border-radius:10px;
    background:#22c55e;
    color:white;
    font-weight:bold;
    cursor:pointer;
  }
  .card{
    background:#111827;
    padding:25px;
    border-radius:20px;
    margin-top:30px;
    display:inline-block;
    text-align:left;
  }
  </style>
  </head>
  <body>

  <h1>ASJUJ Product Verifier</h1>

  <form method="POST" action="/verify">
  <input name="gpid" placeholder="Enter GPID"/>
  <br>
  <button>VERIFY</button>
  </form>

  ${content || ""}

  </body>
  </html>
  `;
}

// ================= ROUTES =================

// Home
app.get("/", (req,res)=>{
  res.send(page());
});

// QR scan support
app.get("/verify", async (req,res)=>{
  try{
    const gpid = req.query.gpid;
    if(!gpid) return res.send(page("Missing GPID"));

    const p = await contract.getProduct(gpid);

    res.send(page(`
      <div class="card">
      <h2>Verified Product</h2>
      <b>GPID:</b> ${p[0]}<br>
      <b>Brand:</b> ${p[1]}<br>
      <b>Model:</b> ${p[2]}<br>
      <b>Category:</b> ${p[3]}<br>
      <b>Factory:</b> ${p[4]}<br>
      <b>Batch:</b> ${p[5]}<br>
      <b>Born:</b> ${new Date(Number(p[6])*1000).toUTCString()}<br>
      <b>Issuer:</b> ${p[7]}<br>
      <b>Owner:</b> ${p[8]}<br><br>
      <b style="color:#22c55e">AUTHENTIC PRODUCT</b>
      </div>
    `));

  }catch(e){
    res.send(page(`<div class="card">❌ Product Not Found</div>`));
  }
});

// POST verify (FORM submit fix)
app.post("/verify", async (req,res)=>{
  try{
    const gpid = req.body.gpid;
    const p = await contract.getProduct(gpid);

    res.send(page(`
      <div class="card">
      <h2>Verified Product</h2>
      <b>GPID:</b> ${p[0]}<br>
      <b>Brand:</b> ${p[1]}<br>
      <b>Model:</b> ${p[2]}<br>
      <b>Category:</b> ${p[3]}<br>
      <b>Factory:</b> ${p[4]}<br>
      <b>Batch:</b> ${p[5]}<br>
      <b>Born:</b> ${new Date(Number(p[6])*1000).toUTCString()}<br>
      <b>Issuer:</b> ${p[7]}<br>
      <b>Owner:</b> ${p[8]}<br><br>
      <b style="color:#22c55e">AUTHENTIC PRODUCT</b>
      </div>
    `));

  }catch(e){
    res.send(page(`<div class="card">❌ Product Not Found</div>`));
  }
});

// ================= START =================

app.listen(PORT, ()=>{
  console.log("Verifier running on", PORT);
});