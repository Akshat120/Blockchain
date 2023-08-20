const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");
const web3 = new Web3(ganache.provider());

const { abi, evm } = require("../compile");

let accounts;
let lottery;
let testEther = 0.1;
let testAmount = web3.utils.toWei(testEther, "ether");
let ownerIndex = 0;
let Owner;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ from: accounts[0], gas: "1000000" });
  Owner = accounts[ownerIndex];
});

describe("lottery", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("Enter function testing", async () => {
    await EnterFunctionTesting();
  });

  it("pickWinner by owner function testing", async () => {
    await EnterFunctionTesting();

    let initialAmount = await web3.eth.getBalance(lottery.options.address);
    let initialAmountAc = await web3.eth.getBalance(accounts[1]);
    let message = await lottery.methods.pickWinner(accounts[1]).send({
      from: Owner,
      gasLimit: "1000000",
    });
    let newAmount = await web3.eth.getBalance(lottery.options.address);
    let newAmountAc = await web3.eth.getBalance(accounts[1]);
    assert.equal(0, newAmount);
    assert.equal(initialAmount, newAmountAc - initialAmountAc);
  });

  it("pickWinner by notOwner function testing", async () => {
    await EnterFunctionTesting();
    let err;
    try {
      let message = await lottery.methods.pickWinner(accounts[1]).call({
        from: accounts[1],
      });
    } catch (error) {
      err = error;
      assert.ok({ message: "owner is not-compromised." });
    }
    if (!err) assert.fail("Owner is compromised");
  });

  it("getPlayers by notOwner function testing", async () => {
    await EnterFunctionTesting();

    let err;
    try {
      let message = await lottery.methods.getPlayers().call({
        from: accounts[1],
      });
    } catch (error) {
      err = error;
      assert.ok({ message: "owner is not-compromised." });
    }
    if (!err) assert.fail("Owner is compromised");
  });

  it("getPlayers by Owner function testing", async () => {
    await EnterFunctionTesting();
    const players = await lottery.methods.getPlayers().call({
      from: Owner,
    });
    assert.equal(players.length, accounts.length);

    for (let i = 0; i < players.length; i++) {
      assert.equal(players[i], accounts[i]);
    }
  });
});

async function EnterFunctionTesting() {
  try {
    for (let i = 0; i < accounts.length; i++) {
      let initialAmount = await web3.eth.getBalance(lottery.options.address);
      const message = await lottery.methods.Enter().send({
        from: accounts[i],
        value: testAmount,
        gasLimit: "1000000",
      });
      let newAmount = await web3.eth.getBalance(lottery.options.address);
      assert.equal(testAmount, newAmount - initialAmount);
    }
  } catch (error) {
    assert.fail("Error occurred in enter function....");
  }
}
