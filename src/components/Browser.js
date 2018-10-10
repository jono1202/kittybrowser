import React, { Component } from 'react';
import { object } from 'prop-types';
import Web3 from 'web3';
import KittyCoreABI from '../contracts/KittyCoreABI.json';
import { CONTRACT_NAME, CONTRACT_ADDRESS } from '../config';
import { drizzleConnect } from 'drizzle-react';

class Browser extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataKey: null
    }
  }

  componentDidMount() {

    const web3 = new Web3(window['web3'].currentProvider);

    // Initialize the contract instance

    const kittyContract = new web3.eth.Contract(
      KittyCoreABI, // import the contracts's ABI and use it here
      CONTRACT_ADDRESS,
    );
 
    this.context.drizzle.addContract({
      contractName: CONTRACT_NAME,
      web3Contract: kittyContract,
    })

  }

  cacheGetKitty = (kittyId) => {
    let state = this.context.drizzle.store.getState();
    if(state.drizzleStatus.initialized && this.context.drizzle.contracts[CONTRACT_NAME]) {
      const dataKey = this.context.drizzle.contracts[CONTRACT_NAME].methods.getKitty.cacheCall(kittyId)
      this.setState({
        dataKey
      })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.cacheGetKitty(this.state.kittyId)
  }

  handleInput = (e) => {
    this.setState({
      kittyId: e.target.value
    })
  }

  handleRandomSubmit = (e) => {
    e.preventDefault()
    let randomId = Math.floor(Math.random() * 1083985)
    this.cacheGetKitty(randomId)
  }
 
  createDisplayInfo = (kittyInfo, dataKey) => {
    if (kittyInfo && kittyInfo[dataKey] && kittyInfo[dataKey].error) {
      // Handling errors
      switch (kittyInfo[dataKey].error.message) {
        case 'Returned values aren\'t valid, did it run Out of Gas?':
          return (
            <div className="error">
              Entered kitty does not exist, try again.
            </div>
          )
          break
        default:
          return (
            <div className="error">
              Unknown error occured, );.
            </div>
          )

      }
    } else if (kittyInfo && kittyInfo[dataKey] && kittyInfo[dataKey].value) {
      let date = new Date(1970, 0, 1)
      date.setSeconds(parseInt(kittyInfo[dataKey].value.birthTime, 10))  
      let options = { year: 'numeric', month: 'long', day: 'numeric' }
      let dateString = date.toLocaleDateString("en-US", options)

      return (
        <div>
          <label htmlFor="Genes">Genes: </label>
          <div>{kittyInfo[dataKey].value.genes}</div>
          <label htmlFor="Generation">Generation: </label>
          <div>{kittyInfo[dataKey].value.generation}</div>
          <label htmlFor="Birth Time">Birth Time: </label>
          <div>{dateString}</div>
          <img className="kitty-image" src={
            'https://storage.googleapis.com/ck-kitty-image/0x06012c8cf97bead5deae237070f9587f8e7a266d/' 
            + parseInt(kittyInfo[dataKey].args[0], 10)
            + '.svg'
            } />
        </div>
      )
    } else {
      return false
    }
  }

  render() {
    let displayInfo = this.createDisplayInfo(this.props.kittyInfo, this.state.dataKey)

    return (
      <div className="browser">
        <h1>
          Kitty Browser
        </h1>

        <form autoComplete="off" className="id-form" onSubmit={this.handleSubmit}>
          <label htmlFor="inputField">Kitty ID: </label><br/>
          <input className="id-input" id="inputField" type="text" onChange={this.handleInput}/>
          <button>FIND KITTY</button>
        </form>
        <form onSubmit={this.handleRandomSubmit}>
          <button>FIND RANDOM KITTY</button>
        </form>
        
        {displayInfo}

      </div>
    );
  }
}

const mapStateToProps = state => {
  return state.contracts[CONTRACT_NAME]
    ? { kittyInfo: state.contracts[CONTRACT_NAME].getKitty } 
    : {}
}

Browser.contextTypes = {
  drizzle: object,
};

export default drizzleConnect(Browser, mapStateToProps);
// export default Browser
