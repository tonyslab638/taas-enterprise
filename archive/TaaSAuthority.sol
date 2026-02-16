pragma solidity ^0.8.20;

contract TaaSAuthority {

    address public owner;

    mapping(address => bool) public approvedBrands;
    mapping(address => bool) public approvedDealers;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    function addBrand(address brand) external onlyOwner {
        approvedBrands[brand] = true;
    }

    function addDealer(address dealer) external onlyOwner {
        approvedDealers[dealer] = true;
    }

    function isBrand(address user) external view returns (bool) {
        return approvedBrands[user];
    }

    function isDealer(address user) external view returns (bool) {
        return approvedDealers[user];
    }
}