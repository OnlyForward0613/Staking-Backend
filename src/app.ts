import dotenv from 'dotenv';
import express from 'express';
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import { ethers } from 'ethers';
import { contractABI, contractAddress } from './cosntants';

// load the environment variables from the .env file
dotenv.config({
  path: '.env'
});

const app = express();
const server = http.createServer(app);
const privateKey = process.env.PRIVATE_KEY as string;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const signer = new ethers.Wallet(privateKey);
console.log(signer)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // Replace with your node URL or Infura URL

const contract = new ethers.Contract(contractAddress, contractABI, signer.connect(provider));

app.get("/", async (req, res) => {
  res.send("Ethereum Hash Staking Beackend is running ...");
});

app.post("/withdraw", async (req, res) => {
  try {
    console.log("=======> Withdraw Reward");
    const address = req.body.address as string;
    const release = req.body.release as string;
    let tokenIds = JSON.parse(req.body.tokenIds as string);

    let stakedIds = tokenIds.ids as number[];
    let check = release === "1" ? true: false;
    console.log(check)
  
    // tokenIds = {
    //   'ids': [1, 2, 3, 4, 5]
    // }

    console.log("address: ", address)
    console.log("stakedIds: ", stakedIds)
    let bigIntIds=[];
    for (let i = 0; i<stakedIds.length; i++) {
      bigIntIds.push(ethers.toBigInt(stakedIds[i]))
    }

    // Prepare the transaction data
    contract.withdrawReward(address, stakedIds, check)
    .then((tx) => {
      console.log('Transaction sent:', tx.hash);
      res.send(JSON.stringify(tx.hash ? tx.hash : -200));
      return tx.wait(); // Wait for the transaction to be mined
    })
    .then((receipt) => {
      res.send(JSON.stringify(200));
      console.log('Transaction receipt:', receipt);
    })
    .catch((error) => {
      res.status(409).send(error);
      console.error('Error sending transaction:', error);
    });
  } catch (error) {
    console.log(">>>error", error);
    res.status(504).send(error);
  }
});

// make server listen on some port
((port = process.env.APP_PORT || 5000) => {
  server.listen(port, () => console.log(`> Listening on port ${port}`));
})();