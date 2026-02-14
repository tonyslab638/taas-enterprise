// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSProductCore {

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

    event ProductCreated(
        string gpid,
        address indexed issuer,
        address indexed owner,
        uint256 timestamp
    );

    function createProduct(
        string memory gpid,
        string memory brand,
        string memory model,
        string memory category,
        string memory factory,
        string memory batch
    ) external {
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

    function productExists(string memory gpid)
        external
        view
        returns (bool)
    {
        return exists[gpid];
    }
}