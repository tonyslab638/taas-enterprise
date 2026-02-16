// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSAuthorityV2 {

    mapping(address => bool) public authority;

    event AuthorityAdded(address user);

    constructor() {
        authority[msg.sender] = true;
    }

    modifier onlyAuthority() {
        require(authority[msg.sender], "NOT_AUTHORITY");
        _;
    }

    function addAuthority(address user) external onlyAuthority {
        authority[user] = true;
        emit AuthorityAdded(user);
    }

    function checkAuthority(address user) external view returns(bool){
        return authority[user];
    }
}