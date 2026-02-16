// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAuthority {
    function authorities(address) external view returns(bool);
}

contract TaaSProductCoreV2 {

    address public owner;
    address public authorityContract;

    struct Product {
        string gpid;
        string brand;
        string model;
        string category;
        string factory;
        string batch;
        uint256 createdAt;
        address issuer;
        address owner;
    }

    mapping(string => Product) public products;

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyAuthority() {
        require(
            authorityContract != address(0) &&
            IAuthority(authorityContract).authorities(msg.sender),
            "NOT_AUTHORITY"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setAuthorityContract(address _auth) external onlyOwner {
        authorityContract = _auth;
    }

    function createProduct(
        string memory gpid,
        string memory brand,
        string memory model,
        string memory category,
        string memory factory,
        string memory batch
    ) external onlyAuthority {

        require(products[gpid].createdAt == 0, "EXISTS");

        products[gpid] = Product(
            gpid,
            brand,
            model,
            category,
            factory,
            batch,
            block.timestamp,
            msg.sender,
            msg.sender
        );
    }

    function transferOwnership(string memory gpid, address newOwner) external {
        require(products[gpid].owner == msg.sender, "NOT_OWNER");
        products[gpid].owner = newOwner;
    }

    function getProduct(string memory gpid) external view returns(Product memory) {
        return products[gpid];
    }
}