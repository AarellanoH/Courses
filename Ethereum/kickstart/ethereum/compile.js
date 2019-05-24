const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, 'build');

//Delete build folder in case it exists
fs.removeSync(buildPath);

//Read Campaign.sol that contains the contracts
const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf8');

//Compile the contracts
let compileOutput;
compileOutput = solc.compile(source, 1).contracts;

//ReCreate build  folder
fs.ensureDirSync(buildPath);

// Iterate over the contracts in the compileOutput that should contain both contracts
for(let contract in compileOutput){
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(':', '') + '.json'),
    compileOutput[contract]
  );
}
