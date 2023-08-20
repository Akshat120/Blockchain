// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Lottery {
    address public manager;
    mapping(address => uint256) public poolsIn;
    mapping(address => bool) keyExists;
    address[] players;

    constructor() {
        manager = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == manager,
            "Only Owner/Manager can call this function"
        );
        _;
    }
    modifier onlyPays() {
        require(
            msg.value >= 0.01 ether,
            "This transaction requires at least 0.01 ether"
        );
        _;
    }
    modifier onlyPayOnce() {
        require(
            !keyExists[msg.sender],
            "This transaction requires different sender as a sender already exists."
        );
        _;
    }

    function Enter() public payable onlyPayOnce onlyPays {
        poolsIn[msg.sender] = poolsIn[msg.sender] + msg.value;
        keyExists[msg.sender] = true;
        players.push(msg.sender);
    }

    function pickWinner(address payable _address) public onlyOwner {
        _address.transfer(address(this).balance);
        for (uint i = 0; i < players.length; i++) {
            poolsIn[players[i]] = 0;
            keyExists[players[i]] = false;
        }
    }

    function getPlayers() public view onlyOwner returns (address[] memory) {
        return players;
    }
}
