const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);
const { interface, bytecode } = require("../compile");


let accounts;
let contract;
let inbox;
const INITIAL_STRING = 'Hi there';

beforeEach(async() => {
  //Get a list of all the accounts
  accounts = await web3.eth.getAccounts();

  contract = await new web3.eth.Contract(JSON.parse(interface));
  inbox = await contract.deploy({
    data:bytecode,
    arguments:[INITIAL_STRING]
  }).send({
    from: accounts[0],
    gas: '1000000'
  });
  //Use one of those accounts to deploy the contract

});

describe('Inbox', () => {
  it('deploys a contract', () => {
    assert.ok(inbox.options.address);
  });

  it('has an initial message', async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, INITIAL_STRING);
  });

  it('sets a message', async () => {
    const messageToSet = 'This is the new message';
    await inbox.methods.setMessage(messageToSet).send({
      //Account paying for the transaction
      from: accounts[0]
    });
    const messageInInbox = await inbox.methods.message().call();
    assert.equal(messageInInbox, messageToSet);
  });
});
