pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimumContribution) public{
        address newCampaignAddres = new Campaign(minimumContribution, msg.sender);
        deployedCampaigns.push(newCampaignAddres);
    }

    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {

    //--------STRUCTS----------
    //The struct (class) that represents the SpendingRequest that
    //      a manager will submit when he wants to spend in something
    struct SpendingRequest {
        string description;
        uint value;
        address recipient;
        bool complete;
        //Approvers of this spending request
        mapping(address => bool) approvers;
        uint approvalCount;
    }

    //--------MODIFIERS----------
    modifier onlyManager() {
        require(msg.sender == manager);
        _;
    }

    //--------INSTANCE VARIABLES----------
    SpendingRequest[] public spendingRequests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;

    //--------CONSTRUCTOR----------
    function Campaign(uint _minimumContribution, address _manager) public {
        manager = _manager;
        minimumContribution = _minimumContribution;
    }

    //--------FUNCTIONS----------
    function contribute() public payable {
        require (msg.value >= minimumContribution);

        approvers[msg.sender] = true;
        approversCount++;
    }

    function createSpendingRequest(string description, uint value, address recipient) public onlyManager {
        SpendingRequest memory newSpendingRequest = SpendingRequest({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });

        //Alternative syntax
        // SpendingRequest(description, value, recipient, false);

        spendingRequests.push(newSpendingRequest);
    }

    function approveSpendingRequest(uint spendingRequestIndex) public {
        SpendingRequest storage spendingRequest = spendingRequests[spendingRequestIndex];

        //Check if the sender is an approver
        require(approvers[msg.sender]);
        //Check if the sender has not voted already
        require(!spendingRequest.approvers[msg.sender]);

        //Vote to approve request
        spendingRequest.approvalCount++;
        //Mark the sender to know that he has already voted
        spendingRequest.approvers[msg.sender] = true;
    }

    function finalizeSpendingRequest(uint spendingRequestIndex) public {
        SpendingRequest storage spendingRequest = spendingRequests[spendingRequestIndex];

        //Check that the spending request has not been completed before
        require(!spendingRequest.complete);
        //Check that more than 50% of the approvers have approved this spending request
        require(spendingRequest.approvalCount > approversCount/2);

        //Transfer the money to the recipient of the spending request
        spendingRequest.recipient.transfer(spendingRequest.value);
        //Mark the spending request as completed
        spendingRequest.complete = true;

    }
}
