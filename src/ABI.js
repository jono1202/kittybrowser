const axios = require('axios')
const fs = require('fs')

axios
  .get('http://api.etherscan.io/api?module=contract&action=getabi&address=0x06012c8cf97bead5deae237070f9587f8e7a266d')
  .then((response) => {
    if (response.data.result) {
      console.log('ABI fetch successful')
      
      fs.writeFile(
        __dirname + '/contracts/KittyCoreABI.json', 
        response.data.result,
        err => { 
          if(err) { console.log('Unable to write to file', err) }
          else { console.log('Wrote to file') }
        }
      )

    } else {
      console.log('Error')
    }
  })
