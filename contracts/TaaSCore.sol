// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
████████╗ █████╗  █████╗ ███████╗
╚══██╔══╝██╔══██╗██╔══██╗██╔════╝
   ██║   ███████║███████║███████╗
   ██║   ██╔══██║██╔══██║╚════██║
   ██║   ██║  ██║██║  ██║███████║
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝

Enterprise Multi-Tenant Supply Chain Core
*/

contract TaaSCore {

    /*//////////////////////////////////////////////////////////////
                            STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Company {
        string name;
        address owner;
        bool active;
    }

    struct Product {
        string id;
        string brand;
        string model;
        string category;
        string batch;
        uint256 companyId;
        address factory;
        address owner;
        uint256 timestamp;
    }

    /*//////////////////////////////////////////////////////////////
                            STORAGE
    //////////////////////////////////////////////////////////////*/

    address public superAdmin;
    bool public paused;

    uint256 public companyCounter;

    mapping(uint256 => Company) public companies;
    mapping(address => uint256) public walletCompany;

    mapping(uint256 => mapping(address => bool)) public factories;
    mapping(uint256 => mapping(address => bool)) public distributors;
    mapping(uint256 => mapping(address => bool)) public retailers;

    mapping(string => Product) private products;
    mapping(string => bool) public usedIDs;
    mapping(string => address[]) public ownershipHistory;

    /*//////////////////////////////////////////////////////////////
                            EVENTS
    //////////////////////////////////////////////////////////////*/

    event CompanyCreated(uint256 id, string name, address owner);
    event RoleUpdated(uint256 companyId, address wallet, string role, bool status);
    event ProductCreated(string id, uint256 companyId, address owner);
    event ProductTransferred(string id, address from, address to);
    event Paused(bool status);

    /*//////////////////////////////////////////////////////////////
                            MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlySuper() {
        require(msg.sender == superAdmin, "NOT_SUPER");
        _;
    }

    modifier onlyCompanyOwner(uint256 cid) {
        require(companies[cid].owner == msg.sender, "NOT_COMPANY_OWNER");
        _;
    }

    modifier notPaused() {
        require(!paused, "PAUSED");
        _;
    }

    modifier onlyFactory(uint256 cid) {
        require(factories[cid][msg.sender], "NOT_FACTORY");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {
        superAdmin = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                        COMPANY MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    function createCompany(string calldata name, address owner)
        external
        onlySuper
        returns (uint256)
    {
        companyCounter++;

        companies[companyCounter] = Company(
            name,
            owner,
            true
        );

        walletCompany[owner] = companyCounter;

        emit CompanyCreated(companyCounter, name, owner);
        return companyCounter;
    }

    function setCompanyStatus(uint256 cid, bool status)
        external
        onlySuper
    {
        companies[cid].active = status;
    }

    /*//////////////////////////////////////////////////////////////
                        ROLE MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    function setFactory(uint256 cid, address wallet, bool status)
        external
        onlyCompanyOwner(cid)
    {
        factories[cid][wallet] = status;
        emit RoleUpdated(cid, wallet, "FACTORY", status);
    }

    function setDistributor(uint256 cid, address wallet, bool status)
        external
        onlyCompanyOwner(cid)
    {
        distributors[cid][wallet] = status;
        emit RoleUpdated(cid, wallet, "DISTRIBUTOR", status);
    }

    function setRetailer(uint256 cid, address wallet, bool status)
        external
        onlyCompanyOwner(cid)
    {
        retailers[cid][wallet] = status;
        emit RoleUpdated(cid, wallet, "RETAILER", status);
    }

    /*//////////////////////////////////////////////////////////////
                        PRODUCT CREATION
    //////////////////////////////////////////////////////////////*/

    function createProduct(
        string calldata id,
        string calldata brand,
        string calldata model,
        string calldata category,
        string calldata batch,
        address initialOwner
    )
        external
        notPaused
    {
        uint256 cid = walletCompany[msg.sender];

        require(cid != 0, "NO_COMPANY");
        require(companies[cid].active, "COMPANY_DISABLED");
        require(factories[cid][msg.sender], "NOT_FACTORY");
        require(!usedIDs[id], "ID_EXISTS");

        products[id] = Product(
            id,
            brand,
            model,
            category,
            batch,
            cid,
            msg.sender,
            initialOwner,
            block.timestamp
        );

        usedIDs[id] = true;
        ownershipHistory[id].push(initialOwner);

        emit ProductCreated(id, cid, initialOwner);
    }

    /*//////////////////////////////////////////////////////////////
                        PRODUCT TRANSFER
    //////////////////////////////////////////////////////////////*/

    function transferProduct(string calldata id, address to)
        external
        notPaused
    {
        Product storage p = products[id];

        require(p.owner == msg.sender, "NOT_OWNER");

        p.owner = to;
        ownershipHistory[id].push(to);

        emit ProductTransferred(id, msg.sender, to);
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getProduct(string calldata id)
        external
        view
        returns (Product memory)
    {
        require(usedIDs[id], "NOT_FOUND");
        return products[id];
    }

    function getHistory(string calldata id)
        external
        view
        returns (address[] memory)
    {
        return ownershipHistory[id];
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN CONTROL
    //////////////////////////////////////////////////////////////*/

    function setPause(bool state) external onlySuper {
        paused = state;
        emit Paused(state);
    }

    function transferSuper(address newAdmin) external onlySuper {
        superAdmin = newAdmin;
    }
}