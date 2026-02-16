// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract TaaSProductCore {

    address public owner;
    address public authority;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == authority || msg.sender == owner, "NOT_AUTHORIZED");
        _;
    }

    struct Product {
        string gpid;
        string brand;
        string model;
        string category;
        string factory;
        string batch;
        uint256 timestamp;
        address issuer;
        address currentOwner;
    }

    mapping(string => Product) public products;

    event ProductCreated(string gpid, address owner);
    event OwnershipTransferred(string gpid, address newOwner);
    event AuthoritySet(address authority);

    function setAuthority(address _authority) external onlyOwner {
        authority = _authority;
        emit AuthoritySet(_authority);
    }

    function createProduct(
        string memory gpid,
        string memory brand,
        string memory model,
        string memory category,
        string memory factory,
        string memory batch
    ) external onlyAuthorized {

        require(products[gpid].timestamp == 0, "EXISTS");

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

        emit ProductCreated(gpid, msg.sender);
    }

    function transferOwnership(
        string memory gpid,
        address newOwner
    ) external {

        require(products[gpid].timestamp != 0, "NOT_FOUND");
        require(products[gpid].currentOwner == msg.sender, "NOT_OWNER");

        products[gpid].currentOwner = newOwner;

        emit OwnershipTransferred(gpid, newOwner);
    }

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
        Product memory p = products[gpid];
        require(p.timestamp != 0, "NOT_FOUND");

        return (
            p.gpid,
            p.brand,
            p.model,
            p.category,
            p.factory,
            p.batch,
            p.timestamp,
            p.issuer,
            p.currentOwner
        );
    }
}