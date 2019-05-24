const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

// const { interface, bytecode } = require('../compile');
const compile = require ('../compile');
const interface = compile.interface;
const bytecode = compile.bytecode;

let lotteryContract;
let accounts;

beforeEach(async () =>
{
  accounts = await web3.eth.getAccounts();
  lotteryContract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
        data: bytecode
      })
      .send({
        from: accounts[0],
        gas: '1000000'
      });

});

describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    assert.ok(lotteryContract.options.address);
  });

  it('allows an account to enter the lottery', async() => {
    //Put 2 players into the lottery
    await lotteryContract.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('.01', 'ether')
    });
    await lotteryContract.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('.01', 'ether')
    });

    //Retrieve the players that are playing the lottery
    const players = await lotteryContract.methods.checkPlayers().call({
      from: accounts[0]
    });

    //Check that only the two players are in the lottery
    assert.equal(2, players.length);
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
  });

  it('requires a minimum amount of ether (.01) to enter the lottery', async () => {
    //Try to enter the lottery with less than .01 ether, this should
    //    make the test fail
    try{
      //THIS SHOULD FAIL!
      await lotteryContract.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('.001', 'ether')
      });
      //THIS CODE SHOULD NOT BE REACHED BECAUSE THE TRY WAS EXITED BY THE ERROR
      //    IN THE PREVIOUS STATEMENT
      assert(false);
    }
    catch(err){
      //Check err for existance
      assert(err);
      assert.ok(err);
    }
  })

  it('recollects money from all participants', async() => {
    //Put 2 players into the lottery
    await lotteryContract.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('.01', 'ether')
    });
    await lotteryContract.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('.01', 'ether')
    });

    //Retrieve the amount of ether in the lottery
    const prize = await lotteryContract.methods.checkPrize().call({
      from: accounts[0]
    });

    //Check that the prize equals .02 ether (sum of the entry fees of both of the players)
    assert.equal(web3.utils.toWei('.02', 'ether'), prize);
  });

  it('only allows the manager to pick a winner', async() => {
    try{
      await lotteryContract.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('.01', 'ether')
      })
      await lotteryContract.methods.pickWinner().send({
        from: accounts[0]
      });
      console.log('after picking winner');
      assert(false);
      // throw new Exception("myException");
    }
    catch(err){
      // console.log('err', err);
      assert.ok(err);
      console.log('after asserting err');
    }
  });

  it('sends money to the lottery and then the winner receives the prize', async() => {
    //Balance before entering the lottery
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    //Enter the lottery with 2 ether
    await lotteryContract.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2','ether')
    });
    //Balance after paying the entry fee of the lottery
    const balanceAfterEntry = await web3.eth.getBalance(accounts[0]);
    //Pick a winner. There's only 1 player so the ether should return to accounts[0]
    await lotteryContract.methods.pickWinner().send({
      from: accounts[0]
    });
    //Balance after receiving prize should be almost the same as the initial money
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const gasQuantity = initialBalance - balanceAfterEntry;

    console.log('gasQuantity: ', gasQuantity);
    console.log('initialBalance: ', initialBalance);
    console.log('balanceAfterEntry: ', balanceAfterEntry);
    console.log('finalBalance: ', finalBalance);

    assert(initialBalance - web3.utils.toWei('2', 'ether') >= balanceAfterEntry);
    assert(finalBalance - balanceAfterEntry > web3.utils.toWei('1.8','ether'));

    //Test if the array gets emptied
    //Test if the prize is 0 (is given to the players)
  });
});
