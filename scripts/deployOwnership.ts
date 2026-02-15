import { ethers } from "ethers";
import dotenv from "dotenv";
import artifact from "../artifacts/contracts/TaaSOwnershipEngine.sol/TaaSOwnershipEngine.json" with { type: "json" };

dotenv.config();

async function main() {
  const RPC = process.env.SEPOLIA_RPC_URL!;
  const PK = process.env.PRIVATE_KEY!;
  const CORE = process.env.CORE_CONTRACT!;
  const HIER = process.env.HIERARCHY_CONTRACT!;

  if (!RPC || !PK || !CORE || !HIER)
    throw new Error("Missing ENV variables");

  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PK, provider);

  console.log("====================================");
  console.log("Deploying Ownership Engine with:", wallet.address);
  console.log("Balance:", ethers.formatEther(await provider.getBalance(wallet.address)));
  console.log("====================================");

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  const contract = await factory.deploy(CORE, HIER);

  console.log("Deploying contract...");
  await contract.waitForDeployment();

  console.log("====================================");
  console.log("✅ OWNERSHIP ENGINE DEPLOYED");
  console.log("Address:", await contract.getAddress());
  console.log("====================================");
}

main().catch(console.error);