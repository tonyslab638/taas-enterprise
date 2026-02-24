export const CONTRACT_ADDRESS = "0xbB628600884b8B0A595B3536E7AEB93c5bEb736f"

export const ABI = [
  {
    inputs: [{ internalType: "string", name: "id", type: "string" }],
    name: "getProduct",
    outputs: [
      {
        components: [
          { internalType: "string", name: "id", type: "string" },
          { internalType: "string", name: "brand", type: "string" },
          { internalType: "string", name: "model", type: "string" },
          { internalType: "string", name: "category", type: "string" },
          { internalType: "string", name: "batch", type: "string" },
          { internalType: "uint256", name: "companyId", type: "uint256" },
          { internalType: "address", name: "factory", type: "address" },
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "uint256", name: "timestamp", type: "uint256" }
        ],
        internalType: "struct TaaSCore.Product",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "id", type: "string" },
      { internalType: "string", name: "brand", type: "string" },
      { internalType: "string", name: "model", type: "string" },
      { internalType: "string", name: "category", type: "string" },
      { internalType: "string", name: "batch", type: "string" },
      { internalType: "address", name: "initialOwner", type: "address" }
    ],
    name: "createProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
]