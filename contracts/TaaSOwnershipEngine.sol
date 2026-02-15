// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IHierarchy {
    function isBrand(address) external view returns(bool);
    function isDealer(address) external view returns(bool);
}

contract TaaSOwnershipEngine {

    enum Status {
        NONE,
        ACTIVE,
        STOLEN
    }

    struct Ownership {
        address currentOwner;
        Status status;
        address[] history;
    }

    mapping(string => Ownership) private ownerships;

    IHierarchy public hierarchy;
    address public coreContract;

    modifier onlyCore() {
        require(msg.sender == coreContract, "ONLY_CORE");
        _;
    }

    constructor(address _core, address _hierarchy) {
        require(_core != address(0), "BAD_CORE");
        require(_hierarchy != address(0), "BAD_HIERARCHY");
        coreContract = _core;
        hierarchy = IHierarchy(_hierarchy);
    }

    // ======================================================
    // FIRST OWNER SET (CALLED BY CORE ON CREATION)
    // ======================================================
    function registerInitialOwner(string calldata gpid, address owner)
        external
        onlyCore
    {
        require(ownerships[gpid].currentOwner == address(0), "ALREADY_REGISTERED");

        Ownership storage o = ownerships[gpid];
        o.currentOwner = owner;
        o.status = Status.ACTIVE;
        o.history.push(owner);
    }

    // ======================================================
    // TRANSFER OWNERSHIP
    // ======================================================
    function transferOwnership(string calldata gpid, address newOwner) external {

        Ownership storage o = ownerships[gpid];

        require(o.currentOwner != address(0), "NOT_EXIST");
        require(o.status == Status.ACTIVE, "NOT_TRANSFERABLE");
        require(msg.sender == o.currentOwner, "NOT_OWNER");
        require(newOwner != address(0), "BAD_NEW_OWNER");

        o.currentOwner = newOwner;
        o.history.push(newOwner);
    }

    // ======================================================
    // MARK STOLEN
    // ======================================================
    function markStolen(string calldata gpid) external {

        Ownership storage o = ownerships[gpid];

        require(msg.sender == o.currentOwner, "NOT_OWNER");
        require(o.status == Status.ACTIVE, "ALREADY_LOCKED");

        o.status = Status.STOLEN;
    }

    // ======================================================
    // RECOVER ITEM
    // ======================================================
    function recoverItem(string calldata gpid) external {

        Ownership storage o = ownerships[gpid];

        require(msg.sender == o.currentOwner, "NOT_OWNER");
        require(o.status == Status.STOLEN, "NOT_STOLEN");

        o.status = Status.ACTIVE;
    }

    // ======================================================
    // DEALER FIRST SALE TRANSFER
    // ======================================================
    function dealerTransfer(
        string calldata gpid,
        address buyer
    ) external {

        require(hierarchy.isDealer(msg.sender), "NOT_AUTHORIZED_DEALER");

        Ownership storage o = ownerships[gpid];

        require(o.currentOwner == msg.sender, "NOT_PRODUCT_HOLDER");
        require(o.status == Status.ACTIVE, "LOCKED");

        o.currentOwner = buyer;
        o.history.push(buyer);
    }

    // ======================================================
    // GET CURRENT OWNER
    // ======================================================
    function getOwner(string calldata gpid)
        external view returns(address)
    {
        return ownerships[gpid].currentOwner;
    }

    // ======================================================
    // GET STATUS
    // ======================================================
    function getStatus(string calldata gpid)
        external view returns(Status)
    {
        return ownerships[gpid].status;
    }

    // ======================================================
    // FULL HISTORY
    // ======================================================
    function getHistory(string calldata gpid)
        external view returns(address[] memory)
    {
        return ownerships[gpid].history;
    }
}