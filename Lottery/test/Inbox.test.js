const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");
const web3 = new Web3(ganache.provider());

const { abi, evm } = require("../compile");

let accounts;
let lottery;
let testEther = 1;
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

// afterEach(async () => {
//   // Get a list of all accounts
//   console.log("AfterEach----------------------------------------------------");
//   accounts = await web3.eth.getAccounts();
//   for (let i = 0; i < accounts.length; i++) {
//     let bal = await web3.eth.getBalance(accounts[i]);
//     console.log(accounts[i], "=>", bal);
//   }
// });

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
    });
    let newAmount = await web3.eth.getBalance(lottery.options.address);
    let newAmountAc = await web3.eth.getBalance(accounts[1]);
    assert.equal(0, newAmount);
    assert.equal(initialAmount, newAmountAc - initialAmountAc);
  });

  it("pickWinner by notOwner function testing", async () => {
    await EnterFunctionTesting();

    try {
      let message = await lottery.methods.pickWinner(accounts[1]).send({
        from: accounts[1],
      });
      assert.fail("Error occurred in pickWinner function....");
    } catch (error) {
      assert(error.message.includes("revert"), "Expected revert error");
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
      });
      let newAmount = await web3.eth.getBalance(lottery.options.address);
      assert.equal(testAmount, newAmount - initialAmount);
    }
  } catch (error) {
    assert.fail("Error occurred in enter function....");
  }
}
