// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSProductEnterprise {

    enum Status {
        ACTIVE,
        STOLEN
    }

    struct Product {
        string gpid;
        string brand;
        string model;
        string category;
        string factory;
        string batch;
        uint256 bornAt;
        address issuer;
        address owner;
        Status status;
    }

    mapping(string => Product) private products;
    mapping(string => bool) private exists;
    mapping(string => address[]) private ownershipHistory;
    mapping(address => bool) public authorizedDealer;

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "NOT_ADMIN");
        _;
    }

    modifier onlyOwner(string memory gpid) {
        require(products[gpid].owner == msg.sender, "NOT_OWNER");
        _;
    }

    modifier onlyAuthorized(string memory gpid) {
        require(
            msg.sender == products[gpid].issuer ||
            authorizedDealer[msg.sender],
            "NOT_AUTHORIZED"
        );
        _;
    }

    // =========================
    // ADMIN
    // =========================

    function setDealer(address dealer, bool state) external onlyAdmin {
        authorizedDealer[dealer] = state;
    }

    // =========================
    // CREATE PRODUCT
    // =========================

    function createProduct(
        string memory gpid,
        string memory brand,
        string memory model,
        string memory category,
        string memory factory,
        string memory batch
    ) external {

        require(!exists[gpid], "EXISTS");

        products[gpid] = Product(
            gpid,
            brand,
            model,
            category,
            factory,
            batch,
            block.timestamp,
            msg.sender,
            msg.sender,
            Status.ACTIVE
        );

        exists[gpid] = true;
        ownershipHistory[gpid].push(msg.sender);
    }

    // =========================
    // TRANSFER OWNERSHIP
    // =========================

    function transferOwnership(
        string memory gpid,
        address newOwner
    )
        external
        onlyOwner(gpid)
    {
        require(products[gpid].status == Status.ACTIVE, "STOLEN");

        products[gpid].owner = newOwner;
        ownershipHistory[gpid].push(newOwner);
    }

    // =========================
    // DEALER → CUSTOMER
    // =========================

    function dealerTransfer(
        string memory gpid,
        address customer
    )
        external
        onlyAuthorized(gpid)
    {
        products[gpid].owner = customer;
        ownershipHistory[gpid].push(customer);
    }

    // =========================
    // STOLEN SYSTEM
    // =========================

    function markStolen(string memory gpid)
        external
        onlyOwner(gpid)
    {
        products[gpid].status = Status.STOLEN;
    }

    function recoverProduct(string memory gpid)
        external
        onlyOwner(gpid)
    {
        products[gpid].status = Status.ACTIVE;
    }

    // =========================
    // READ PRODUCT
    // =========================

    function getProduct(string memory gpid)
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            address,
            address,
            Status
        )
    {
        require(exists[gpid], "NOT_FOUND");

        Product memory p = products[gpid];

        return (
            p.gpid,
            p.brand,
            p.model,
            p.category,
            p.factory,
            p.batch,
            p.bornAt,
            p.issuer,
            p.owner,
            p.status
        );
    }

    // =========================
    // HISTORY
    // =========================

    function getOwnershipHistory(string memory gpid)
        external
        view
        returns (address[] memory)
    {
        return ownershipHistory[gpid];
    }

    function productExists(string memory gpid)
        external
        view
        returns (bool)
    {
        return exists[gpid];
    }
}
