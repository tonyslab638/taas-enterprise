// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSAuthorityCore {

    address public superAdmin;

    constructor() {
        superAdmin = msg.sender;
    }

    // =========================
    // ROLES
    // =========================

    mapping(address => bool) public brands;
    mapping(address => bool) public factories;
    mapping(address => bool) public dealers;

    mapping(address => address) public brandOwner;
    mapping(address => address) public factoryOwner;
    mapping(address => address) public dealerOwner;

    // =========================
    // EVENTS
    // =========================

    event BrandAdded(address brand);
    event FactoryAdded(address factory);
    event DealerAdded(address dealer);

    // =========================
    // MODIFIERS
    // =========================

    modifier onlySuper() {
        require(msg.sender == superAdmin, "NOT_SUPER_ADMIN");
        _;
    }

    modifier onlyBrand() {
        require(brands[msg.sender], "NOT_BRAND");
        _;
    }

    // =========================
    // ADD BRAND
    // =========================

    function addBrand(address brand) external onlySuper {
        brands[brand] = true;
        brandOwner[brand] = msg.sender;
        emit BrandAdded(brand);
    }

    // =========================
    // ADD FACTORY
    // =========================

    function addFactory(address factory) external onlyBrand {
        factories[factory] = true;
        factoryOwner[factory] = msg.sender;
        emit FactoryAdded(factory);
    }

    // =========================
    // ADD DEALER
    // =========================

    function addDealer(address dealer) external onlyBrand {
        dealers[dealer] = true;
        dealerOwner[dealer] = msg.sender;
        emit DealerAdded(dealer);
    }

    // =========================
    // ROLE CHECKS
    // =========================

    function isBrand(address user) external view returns (bool) {
        return brands[user];
    }

    function isFactory(address user) external view returns (bool) {
        return factories[user];
    }

    function isDealer(address user) external view returns (bool) {
        return dealers[user];
    }
}