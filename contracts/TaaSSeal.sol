// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSSeal {

    mapping(string => bytes32) public seals;

    event SealCreated(string gpid, bytes32 seal);

    function createSeal(
        string memory gpid,
        string memory brand,
        string memory model,
        string memory factory,
        address issuer
    ) external {

        require(seals[gpid] == bytes32(0),"SEAL_EXISTS");

        bytes32 seal = keccak256(
            abi.encodePacked(
                gpid,
                brand,
                model,
                factory,
                issuer,
                block.timestamp,
                block.prevrandao
            )
        );

        seals[gpid] = seal;

        emit SealCreated(gpid, seal);
    }

    function verifySeal(
        string memory gpid,
        bytes32 seal
    ) external view returns(bool){
        return seals[gpid] == seal;
    }
}