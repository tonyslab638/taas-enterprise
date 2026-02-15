// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAuthority {
    function isFactory(address user) external view returns (bool);
}

contract TaaSProductSecure {

    IAuthority public authority;

    constructor(address authorityAddress) {
        authority = IAuthority(authorityAddress);
    }

    struct Product {
        string gpid;
        string brand;
        string model;
        string category;
        string factory;
        string batch;
        uint256 bornAt;
        address creator;
        address owner;
    }

    mapping(string => Product) private products;
    mapping(string => bool) private exists;

    event ProductCreated(
        string gpid,
        address creator,
        uint256 timestamp
    );

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

        require(authority.isFactory(msg.sender), "NOT_AUTHORIZED_FACTORY");
        require(!exists[gpid], "GPID_EXISTS");
        require(bytes(gpid).length > 0, "INVALID_GPID");

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

        exists[gpid] = true;

        emit ProductCreated(gpid, msg.sender, block.timestamp);
    }

    // =========================
    // VERIFY PRODUCT
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
            p.creator,
            p.owner
        );
    }

    function existsProduct(string memory gpid) external view returns (bool) {
        return exists[gpid];
    }
}