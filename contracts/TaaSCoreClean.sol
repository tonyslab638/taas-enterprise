// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSCoreClean {

    address public owner;
    address public authority;

    event AuthorityUpdated(address indexed newAuthority);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setAuthority(address _auth) external onlyOwner {
        require(_auth != address(0), "INVALID_AUTHORITY");

        authority = _auth;
        emit AuthorityUpdated(_auth);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ZERO_ADDRESS");

        address old = owner;
        owner = newOwner;

        emit OwnershipTransferred(old, newOwner);
    }

    function getAuthority() external view returns(address) {
        return authority;
    }
}