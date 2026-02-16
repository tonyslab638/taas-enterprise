// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    TAAS ROOT CONTROL
    Supreme authority contract
    Controls entire ecosystem permissions
*/

contract TaaSRootControl {

    address public owner;

    mapping(address => bool) public authorities;
    mapping(address => bool) public brands;
    mapping(address => bool) public factories;
    mapping(address => bool) public dealers;
    mapping(address => bool) public blacklisted;

    event AuthorityAdded(address indexed authority);
    event BrandAdded(address indexed brand);
    event FactoryAdded(address indexed factory);
    event DealerAdded(address indexed dealer);
    event Revoked(address indexed target);
    event Blacklisted(address indexed target);

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

    // =========================
    // AUTHORITY CONTROL
    // =========================

    function addAuthority(address a) external onlyOwner {
        authorities[a] = true;
        emit AuthorityAdded(a);
    }

    function removeAuthority(address a) external onlyOwner {
        authorities[a] = false;
        emit Revoked(a);
    }

    // =========================
    // ROLE CONTROL
    // =========================

    function addBrand(address a) external onlyAuthority {
        brands[a] = true;
        emit BrandAdded(a);
    }

    function addFactory(address a) external onlyAuthority {
        factories[a] = true;
        emit FactoryAdded(a);
    }

    function addDealer(address a) external onlyAuthority {
        dealers[a] = true;
        emit DealerAdded(a);
    }

    function revoke(address a) external onlyAuthority {
        brands[a] = false;
        factories[a] = false;
        dealers[a] = false;
        emit Revoked(a);
    }

    function blacklist(address a) external onlyAuthority {
        blacklisted[a] = true;
        emit Blacklisted(a);
    }

    // =========================
    // VIEW HELPERS
    // =========================

    function isAuthority(address a) external view returns(bool){
        return authorities[a];
    }

    function isBrand(address a) external view returns(bool){
        return brands[a];
    }

    function isFactory(address a) external view returns(bool){
        return factories[a];
    }

    function isDealer(address a) external view returns(bool){
        return dealers[a];
    }

    function isBlacklisted(address a) external view returns(bool){
        return blacklisted[a];
    }
}