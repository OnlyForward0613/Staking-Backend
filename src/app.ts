import dotenv from 'dotenv';
import express from 'express';
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import Web3 from "web3";
import { contractABI, contractAddress } from './cosntants';

// load the environment variables from the .env file
dotenv.config({
  path: '.env'
});

const privateKey = process.env.PRIVATE_KEY as string;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'); // Replace with your Infura project ID or other Ethereum provider URL
const contract = new web3.eth.Contract(contractABI, contractAddress);

app.get("/", async (req, res) => {
  res.send("Ethereum Hash Staking Beackend is running ...");
});

app.post("/withdraw", async (req, res) => {
  try {
    console.log("=======> Withdraw Reward");
    const address = req.body.address as string;
    const amount = req.body.amount as string;
    
    // Get the account object from the private key
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    // Get the current gas price
    const gasPrice = await web3.eth.getGasPrice();

    // Prepare the transaction data
    const data = contract.methods.withdraw(address, parseInt(amount)).encodeABI();

    const txObject = {
      from: account.address,
      to: contractAddress,
      gas: web3.utils.toHex(300000), // You can adjust the gas limit as needed
      gasPrice: web3.utils.toHex(gasPrice),
      data: data,
    };

    // Sign the transaction with the private key
    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

    // Send the transaction
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.json({ transactionHash: receipt.transactionHash });

  } catch (error) {
    console.log(">>>error", error);
    res.status(504).send(error);
  }
});

// make server listen on some port
((port = process.env.APP_PORT || 5000) => {
  server.listen(port, () => console.log(`> Listening on port ${port}`));
})();