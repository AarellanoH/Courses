//Deploy to a non-local network
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface, bytecode} = require('./compile')

const provider = new HDWalletProvider(
  //mnemonic
  'hollow village column improve course keen sport bus when fix shadow banner',
  //url of network to connect to
  'https://rinkeby.infura.io/v3/3e14813af5634fe7960c93f8d5000854'
);
const web3 = new Web3(provider);
const INITIAL_STRING = 'Hello World';

const deploy = async() => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  console.log('Attempting to deploy from account', account);

  const deployResult = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
      arguments: [INITIAL_STRING]
    })
    .send({
      gas: 1000000,
      from: account
    });

    console.log('Contract deployed to', deployResult.options.address);
};
deploy();
