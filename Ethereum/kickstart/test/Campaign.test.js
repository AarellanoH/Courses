const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async() => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({data: compiledFactory.bytecode})
    .send({from: accounts[0], gas: '1000000'});

  await factory.methods.createCampaign('100').send({
    from: accounts[0],
    gas: '1000000'
  });

  //equivalent to campaignAddres = result[0]
  [campaignAddress] = await factory.methods.getDeployedCampaigns().call({});

  //get reference to the already deployed Campaign contract by passing the address
  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
   );
});

describe('Campaigns', () => {
  it('deploys a factory and a campaign', () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('saves the creator of the campaign as the manager', async() => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it('allows people to make contributions and mark them as approvers', async() => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '100'
    });

    const isApprover = await campaign.methods.approvers(accounts[1]).call();
    assert(isApprover);
  });

  it('requires a minimum contribution', async() => {
    try{
      await campaign.methods.contribute().send({
        from: accounts[1],
        value: '50'
      });
      throw new Error('error');
    }
    catch(error){
      assert.notEqual('error', error.message);
    }
  });

  it('allows the manager to create a spending request', async() => {
    await campaign.methods
      .createSpendingRequest('Buy something', '100', accounts[1])
      .send({
        from: accounts[0],
        gas: '1000000'
      }
    );
    const spendingRequest = await campaign.methods.spendingRequests(0).call();
    assert.equal('Buy something', spendingRequest.description);
  });

  it('processes requests', async() => {
    //User 1 contributes 10 ether so that there are funds in the contract
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: web3.utils.toWei('10', 'ether')
    });

    //Manager creates a spending request in which user 2 is the recipient 5 ether
    await campaign.methods
      .createSpendingRequest('Buy something', web3.utils.toWei('5', 'ether'), accounts[2])
      .send({
        from: accounts[0],
        gas: '1000000'
      }
    );

    //User 1, as the sole contributor (= approver) has to approve the request
    await campaign.methods.approveSpendingRequest(0).send({
      from: accounts[1],
      gas: '1000000'
    });

    //Spending request has 100% approval, manager should be able to finalize it
    await campaign.methods.finalizeSpendingRequest(0).send({
      from: accounts[0],
      gas: '1000000'
    })

    //Get the balance of User 2, who should have almost 105 ether
    let balance = await web3.eth.getBalance(accounts[2]);
    balance = web3.utils.fromWei(balance,'ether');
    balance = parseFloat(balance);
    console.log('Balance: ', balance)
    assert(balance > 104);

  });
});
