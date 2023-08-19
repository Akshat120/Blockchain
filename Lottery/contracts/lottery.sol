// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Lottery {
    address public manager;
    mapping(address => uint256) public pools;

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
    modifier payOneEther() {
        require(msg.value == 1 ether, "This transaction requires 1 ether");
        _;
    }

    function Enter() public payable payOneEther {
        pools[msg.sender] = pools[msg.sender] + msg.value;
    }

    function pickWinner(address payable _address) public onlyOwner {
        _address.transfer(address(this).balance);
    }
}
