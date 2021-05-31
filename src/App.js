import React, { Component } from "react";
import AuctionContract from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { highestBid: 0, web3: null, accounts: null, contract: null ,input:"",highestBidder: null,balance: 0,userBalance: 0};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        AuctionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      const response = await instance.methods.highestBid().call();
      const bidder = await instance.methods.highestBidder().call();
      const balance = await instance.methods.getContractBalance().call();
      const userBalance = await instance.methods.userBalances(accounts[0]).call();
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance , highestBid:response,highestBidder: bidder,balance:balance,userBalance:userBalance});
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  bid = async () => {
    const {accounts, contract} = this.state;

    
    await contract.methods.bid().send({ from: accounts[0] ,value:this.state.input});

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.highestBid().call();
    const bidder = await contract.methods.highestBidder().call();
    const balance = await contract.methods.getContractBalance().call();
    const userBalance = await contract.methods.userBalances(accounts[0]).call();
    // Update state with the result.
    this.setState({ highestBid: response ,highestBidder: bidder,balance:balance,userBalance:userBalance});
  };

  withdraw = async () => {
    const { accounts, contract } = this.state;

   
    await contract.methods.withdraw().send({ from: accounts[0]});
    const balance = await contract.methods.getContractBalance().call();
    const userBalance = await contract.methods.userBalances(accounts[0]).call();
    // Update state with the result.
    this.setState({balance:balance,userBalance:userBalance});

  };


  myHandler = (event) =>{
    this.setState({input:event.target.value},()=>{
      console.log(this.state.input)
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    let canWithdraw
    if(this.state.highestBidder === this.state.accounts[0]){
      canWithdraw= <div>      
         <p>You are the highest bidder you can not withdraw</p>
         </div>
    }
    if(this.state.userBalance == 0){
      canWithdraw= <div>      
         <p>You haven't made a bid so you can not withdraw</p>
         </div>
    }
    if(this.state.highestBidder != this.state.accounts[0] & this.state.userBalance >0){
      canWithdraw= <div> 
        <p>You can withdraw ,your previous bid of {this.state.userBalance} wei </p>     
     <button onClick={this.withdraw}>Withdraw</button>
      </div>
    }
    return (
      <div className="App">
        <h1>Auction</h1>
        
        <div>The HighestBid is: {this.state.highestBid}</div>
        <br></br>
        <div>The HighestBidder is: {(this.state.highestBidder === this.state.accounts[0]) ? "You" : this.state.highestBidder}</div>
        <br></br>
        <div>The Balance of the contract  is: { this.state.balance}</div>
        <br></br>
        <input type="text" onChange={this.myHandler}/>
        <button onClick={this.bid}>Bid</button>
        <h2>Withdraw</h2>
        {canWithdraw}
      </div>
    );
  }
}

export default App;
