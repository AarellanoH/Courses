pragma solidity ^0.4.17;

contract Lottery
{
    address public manager;
    address[] public players;


    //Constructor
    function Lottery() public
    {
       manager = msg.sender;
    }

    function enter() public payable
    {
        require(msg.value >= .01 ether);
        players.push(msg.sender);
    }

    function random() private view returns (uint)
    {
        return uint(sha256(block.difficulty, now, players));
    }

    function pickWinner() public managerOnly
    {
        address winner = players[random() % players.length];

        //balance has all the money in the contract
        winner.transfer(this.balance);

        //Empty list of players to start a new round of lottery
        players = new address[](0);
    }

    modifier managerOnly()
    {
        //make sure that the manager is the one trying to pick a winner
        require(msg.sender == manager);
        _;
    }

    function checkPrize() public view returns (uint)
    {
        return this.balance;
    }

    function checkPlayers() public view returns (address[])
    {
        return players;
    }

}
