const path = require('path');
const fs = require('fs');
const solc = require('solc');

//Path de inbox/contracts/Inbox.sol
const lotteryContractPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const source = fs.readFileSync(lotteryContractPath, 'utf8');

// console.log(solc.compile(source,1).contracts[':Lottery']);

module.exports = solc.compile(source,1).contracts[':Lottery'];
