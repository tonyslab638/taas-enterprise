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

// ================= HOME =================
app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
  <title>ASJUJ Verify</title>
  </head>
  <body style="
      font-family: Arial;
      text-align:center;
      background:#ffffff;
      margin-top:120px;
  ">
      <h1>ASJUJ Product Verification</h1>

      <form action="/verify">
          <input 
              name="gpid" 
              placeholder="Enter GPID"
              style="padding:12px;width:280px;font-size:16px"
          />
          <br><br>
          <button style="padding:12px 40px;font-size:16px">
              Verify Product
          </button>
      </form>
  </body>
  </html>
  `);
});


// ================= VERIFY =================
app.get("/verify", async (req, res) => {
  try {
    const gpid = req.query.gpid;

    const p = await contract.getProduct(gpid);

    res.send(`
    <html>
    <body style="
        font-family: Arial;
        text-align:center;
        background:#ffffff;
        margin-top:80px;
    ">

    <h2>✔ ASJUJ Verified Product</h2>

    <p><b>GPID:</b> ${p[0]}</p>
    <p><b>Brand:</b> ${p[1]}</p>
    <p><b>Model:</b> ${p[2]}</p>
    <p><b>Category:</b> ${p[3]}</p>
    <p><b>Factory:</b> ${p[4]}</p>
    <p><b>Batch:</b> ${p[5]}</p>
    <p><b>Born:</b> ${new Date(Number(p[6])*1000).toUTCString()}</p>
    <p><b>Issuer:</b> ${p[7]}</p>
    <p><b>Owner:</b> ${p[8]}</p>

    <br><br>
    <a href="/">Verify Another</a>

    </body>
    </html>
    `);

  } catch {
    res.send(`
    <html>
    <body style="
        font-family: Arial;
        text-align:center;
        background:#ffffff;
        margin-top:120px;
    ">

    <h2>❌ Product Not Found</h2>
    <p>This GPID is not registered on ASJUJ Network.</p>

    <br>
    <a href="/">Try Again</a>

    </body>
    </html>
    `);
  }
});

app.listen(PORT, () =>
  console.log("Verifier running on", PORT)
);