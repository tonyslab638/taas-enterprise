export const CONTRACT_ADDRESS = "0xbB628600884b8B0A595B3536E7AEB93c5bEb736f";

export const ABI = [
  "function walletCompany(address) view returns (uint256)",
  "function createCompany(string name, address owner)",
  "function createProduct(string id,string brand,string model,string category,string batch,address initialOwner)",
  "function getProduct(string id) view returns (tuple(string id,string brand,string model,string category,string batch,uint256 companyId,address factory,address owner,uint256 timestamp))",
  "function transferProduct(string id,address to)",
  "function setFactory(uint256 cid,address wallet,bool status)",
  "function setDistributor(uint256 cid,address wallet,bool status)",
  "function setRetailer(uint256 cid,address wallet,bool status)",
  "function setPause(bool state)",
  "function companies(uint256) view returns (string name,address owner,bool active)"
];