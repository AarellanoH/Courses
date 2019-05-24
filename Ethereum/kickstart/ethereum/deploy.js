//Deploy to a non-local network
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/CampaignFactory.json');

const provider = new HDWalletProvider(
  //mnemonic
  'hollow village column improve course keen sport bus when fix shadow banner',
  //url of network to connect to
  'https://rinkeby.infura.io/v3/3e14813af5634fe7960c93f8d5000854'
);
const web3 = new Web3(provider);

const deploy = async() => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  console.log('Attempting to deploy from account', account);

  const deployResult = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({
      data: compiledFactory.bytecode
    })
    .send({
      gas: 1000000,
      from: account
    });

    console.log('Contract deployed to', deployResult.options.address);
    // Contract deployed to 0xB738002c8e9a57310a6D4736d00E7E763Fd2f8DC
};
deploy();
