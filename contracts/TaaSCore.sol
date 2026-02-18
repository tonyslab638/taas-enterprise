// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSCore {

    address public owner;
    address public authority;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyAuthority() {
        require(msg.sender == authority, "NOT_AUTHORITY");
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
        bytes32 fingerprint;
    }

    mapping(string => Product) private products;
    mapping(bytes32 => bool) public usedFingerprints;

    event AuthoritySet(address authority);
    event ProductCreated(string gpid, address owner, bytes32 fingerprint);
    event OwnershipTransferred(string gpid, address from, address to);

    // ================= ADMIN =================

    function setAuthority(address _auth) external onlyOwner {
        require(_auth != address(0), "ZERO_ADDRESS");
        authority = _auth;
        emit AuthoritySet(_auth);
    }

    // ================= INTERNAL VALIDATION =================

    function _startsWithASJUJ(string memory str) internal pure returns (bool) {
        bytes memory b = bytes(str);
        bytes memory prefix = bytes("ASJUJ-");

        if (b.length < prefix.length) return false;

        for (uint i = 0; i < prefix.length; i++) {
            if (b[i] != prefix[i]) return false;
        }
        return true;
    }

    function _notEmpty(string memory s) internal pure returns (bool) {
        return bytes(s).length > 0;
    }

    // ================= PRODUCT CREATE =================

    function createProduct(
        string memory gpid,
        string memory brand,
        string memory model,
        string memory category,
        string memory factory,
        string memory batch,
        address firstOwner
    ) external onlyAuthority {

        require(_startsWithASJUJ(gpid), "INVALID_GPID_PREFIX");

        require(_notEmpty(gpid), "EMPTY_GPID");
        require(_notEmpty(brand), "EMPTY_BRAND");
        require(_notEmpty(model), "EMPTY_MODEL");
        require(_notEmpty(category), "EMPTY_CATEGORY");
        require(_notEmpty(factory), "EMPTY_FACTORY");
        require(_notEmpty(batch), "EMPTY_BATCH");

        require(firstOwner != address(0), "INVALID_OWNER");

        require(products[gpid].createdAt == 0, "ALREADY_EXISTS");

        bytes32 hash = keccak256(
            abi.encodePacked(gpid, brand, model, factory, batch)
        );

        require(!usedFingerprints[hash], "CLONE_PRODUCT");

        usedFingerprints[hash] = true;

        products[gpid] = Product(
            gpid,
            brand,
            model,
            category,
            factory,
            batch,
            firstOwner,
            block.timestamp,
            hash
        );

        emit ProductCreated(gpid, firstOwner, hash);
    }

    // ================= TRANSFER =================

    function transferOwnership(
        string memory gpid,
        address newOwner
    ) external {

        require(products[gpid].createdAt != 0, "NOT_EXIST");
        require(msg.sender == products[gpid].currentOwner, "NOT_OWNER");
        require(newOwner != address(0), "ZERO_ADDRESS");

        address old = products[gpid].currentOwner;
        products[gpid].currentOwner = newOwner;

        emit OwnershipTransferred(gpid, old, newOwner);
    }

    // ================= VIEW =================

    function getProduct(string memory gpid)
        external
        view
        returns (Product memory)
    {
        require(products[gpid].createdAt != 0, "NOT_EXIST");
        return products[gpid];
    }
}