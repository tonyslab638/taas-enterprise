// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSCore {

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    struct Product {
        string gpid;
        string brand;
        string model;
        string category;
        string factory;
        string batch;
        address currentOwner;
        uint256 createdAt;
    }

    mapping(string => Product) private products;

    event ProductCreated(string gpid, address owner);
    event OwnershipTransferred(string gpid, address from, address to);

    // =========================
    // CREATE PRODUCT
    // =========================
    function createProduct(
        string memory gpid,
        string memory brand,
        string memory model,
        string memory category,
        string memory factory,
        string memory batch,
        address firstOwner
    ) external onlyOwner {

        require(bytes(gpid).length > 0, "EMPTY_ID");
        require(products[gpid].createdAt == 0, "ALREADY_EXISTS");
        require(firstOwner != address(0), "ZERO_OWNER");

        products[gpid] = Product(
            gpid,
            brand,
            model,
            category,
            factory,
            batch,
            firstOwner,
            block.timestamp
        );

        emit ProductCreated(gpid, firstOwner);
    }

    // =========================
    // TRANSFER OWNERSHIP
    // =========================
    function transferOwnership(string memory gpid, address newOwner) external {

        Product storage p = products[gpid];

        require(p.createdAt != 0, "NOT_EXIST");
        require(msg.sender == p.currentOwner, "NOT_OWNER");
        require(newOwner != address(0), "ZERO_ADDRESS");

        address old = p.currentOwner;
        p.currentOwner = newOwner;

        emit OwnershipTransferred(gpid, old, newOwner);
    }

    // =========================
    // GET PRODUCT
    // =========================
    function getProduct(string memory gpid)
        external
        view
        returns (Product memory)
    {
        require(products[gpid].createdAt != 0, "NOT_EXIST");
        return products[gpid];
    }
}