// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSProductCore {

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyBrand() {
        require(brands[msg.sender], "NOT_AUTHORIZED_BRAND");
        _;
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
    }

    mapping(string => Product) private products;
    mapping(string => bool) private exists;
    mapping(address => bool) public brands;

    event BrandAdded(address brand);
    event BrandRemoved(address brand);

    event ProductCreated(
        string gpid,
        address indexed issuer,
        address indexed owner,
        uint256 timestamp
    );

    // ========================
    // BRAND MANAGEMENT
    // ========================

    function addBrand(address brand) external onlyOwner {
        brands[brand] = true;
        emit BrandAdded(brand);
    }

    function removeBrand(address brand) external onlyOwner {
        brands[brand] = false;
        emit BrandRemoved(brand);
    }

    function isBrand(address user) external view returns(bool){
        return brands[user];
    }

    // ========================
    // CREATE PRODUCT
    // ========================

    function createProduct(
        string memory gpid,
        string memory brand,
        string memory model,
        string memory category,
        string memory factory,
        string memory batch
    ) external onlyBrand {

        require(bytes(gpid).length > 0, "INVALID_GPID");
        require(!exists[gpid], "GPID_EXISTS");

        products[gpid] = Product({
            gpid: gpid,
            brand: brand,
            model: model,
            category: category,
            factory: factory,
            batch: batch,
            bornAt: block.timestamp,
            issuer: msg.sender,
            owner: msg.sender
        });

        exists[gpid] = true;

        emit ProductCreated(
            gpid,
            msg.sender,
            msg.sender,
            block.timestamp
        );
    }

    // ========================
    // VERIFY PRODUCT
    // ========================

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
            address
        )
    {
        require(exists[gpid], "PRODUCT_NOT_FOUND");

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
            p.owner
        );
    }

    function productExists(string memory gpid) external view returns (bool) {
        return exists[gpid];
    }
}