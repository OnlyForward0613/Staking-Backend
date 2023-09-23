"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const ethers_1 = require("ethers");
const cosntants_1 = require("./cosntants");
// load the environment variables from the .env file
dotenv_1.default.config({
    path: '.env'
});
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const privateKey = process.env.PRIVATE_KEY;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const signer = new ethers_1.ethers.Wallet(privateKey);
console.log(signer);
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.RPC_URL); // Replace with your node URL or Infura URL
const contract = new ethers_1.ethers.Contract(cosntants_1.contractAddress, cosntants_1.contractABI, signer.connect(provider));
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Ethereum Hash Staking Beackend is running ...");
}));
app.post("/withdraw", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("=======> Withdraw Reward");
        const address = req.body.address;
        const release = req.body.release;
        let tokenIds = JSON.parse(req.body.tokenIds);
        let stakedIds = tokenIds.ids;
        let check = release === "1" ? true : false;
        console.log(check);
        console.log("address: ", address);
        console.log("stakedIds: ", stakedIds);
        let bigIntIds = [];
        for (let i = 0; i < stakedIds.length; i++) {
            bigIntIds.push(ethers_1.ethers.toBigInt(stakedIds[i]));
        }
        // Prepare the transaction data
        contract.withdrawReward(address, stakedIds, check)
            .then((tx) => {
            console.log('Transaction sent:', tx.hash);
            res.send(JSON.stringify(tx.hash ? tx.hash : -200));
            return tx.wait(); // Wait for the transaction to be mined
        })
            .catch((error) => {
            res.status(409).send(error);
            console.error('Error sending transaction:', error);
        });
    }
    catch (error) {
        console.log(">>>error", error);
        res.status(504).send(error);
    }
}));
// make server listen on some port
((port = process.env.APP_PORT || 5000) => {
    server.listen(port, () => console.log(`> Listening on port ${port}`));
})();
