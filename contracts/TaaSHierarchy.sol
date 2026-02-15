// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSHierarchy {

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "NOT_ADMIN");
        _;
    }

    modifier onlyBrand() {
        require(brands[msg.sender], "NOT_BRAND");
        _;
    }

    modifier onlyFactory() {
        require(factories[msg.sender], "NOT_FACTORY");
        _;
    }

    // ================= ROLES =================

    mapping(address => bool) public brands;
    mapping(address => bool) public factories;
    mapping(address => bool) public dealers;

    // ================= EVENTS =================

    event BrandAdded(address indexed brand);
    event FactoryAdded(address indexed factory);
    event DealerAdded(address indexed dealer);

    // ================= ADMIN → BRAND =================

    function addBrand(address brand) external onlyAdmin {
        brands[brand] = true;
        emit BrandAdded(brand);
    }

    // ================= BRAND → FACTORY =================

    function addFactory(address factory) external onlyBrand {
        factories[factory] = true;
        emit FactoryAdded(factory);
    }

    // ================= FACTORY → DEALER =================

    function addDealer(address dealer) external onlyFactory {
        dealers[dealer] = true;
        emit DealerAdded(dealer);
    }

    // ================= CHECKERS =================

    function isBrand(address user) external view returns(bool){
        return brands[user];
    }

    function isFactory(address user) external view returns(bool){
        return factories[user];
    }

    function isDealer(address user) external view returns(bool){
        return dealers[user];
    }
}