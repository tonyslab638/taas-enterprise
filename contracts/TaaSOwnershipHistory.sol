// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICore {
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
        );
}

contract TaaSOwnershipHistory {

    address public core;

    struct Transfer {
        address from;
        address to;
        uint256 time;
    }

    mapping(string => Transfer[]) private history;

    constructor(address coreAddress) {
        core = coreAddress;
    }

    function recordTransfer(
        string memory gpid,
        address from,
        address to
    ) external {

        (, , , , , , , , address owner) =
            ICore(core).getProduct(gpid);

        require(owner == from, "NOT_OWNER");

        history[gpid].push(
            Transfer(from, to, block.timestamp)
        );
    }

    function getHistory(string memory gpid)
        external
        view
        returns (Transfer[] memory)
    {
        return history[gpid];
    }
}