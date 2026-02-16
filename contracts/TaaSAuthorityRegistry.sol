// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract TaaSAuthorityRegistry {

    address public owner;

    mapping(address => bool) public authorities;

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyAuthority() {
        require(authorities[msg.sender], "NOT_AUTHORITY");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorities[msg.sender] = true;
    }

    function addAuthority(address user) external onlyOwner {
        authorities[user] = true;
    }

    function removeAuthority(address user) external onlyOwner {
        authorities[user] = false;
    }

    function isAuthority(address user) external view returns(bool) {
        return authorities[user];
    }
}