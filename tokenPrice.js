let pancakeSwapAbi = require("./pcs.json");
let tokenAbi = require("./token.json");
const Web3 = require("web3");

/*
Required Node.js
-- Usage --
1. Make a directory on your pc
2. Open a terminal 
3. go inside the created directory
4. run : npm i --save web3
5. Change line 77 to desired token and 78 to amount to buy
6. run: node tokenPrice.js
*/

let pancakeSwapContract =
  "0x10ED43C718714eb63d5aA57B78B54704E256024E".toLowerCase();
const web3 = new Web3("https://bscrpc.com/");
async function calcSell(tokensToSell, tokenAddres) {
  const web3 = new Web3("https://bscrpc.com/");
  const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; //BNB

  let tokenRouter = await new web3.eth.Contract(tokenAbi, tokenAddres);
  let tokenDecimals = await tokenRouter.methods.decimals().call();

  tokensToSell = setDecimals(tokensToSell, tokenDecimals);
  let amountOut;
  try {
    let router = await new web3.eth.Contract(
      pancakeSwapAbi,
      pancakeSwapContract
    );
    amountOut = await router.methods
      .getAmountsOut(tokensToSell, [tokenAddres, BNBTokenAddress])
      .call();
    amountOut = web3.utils.fromWei(amountOut[1]);
  } catch (error) {}

  if (!amountOut) return 0;
  return amountOut;
}
async function calcBNBPrice() {
  const web3 = new Web3("https://bscrpc.com/");
  const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // BNB
  const BUSDTokenAddress = "0xe9e7cea3dedca5984780bafc599bd69add087d56"; // BUSD
  let bnbToSell = web3.utils.toWei("1", "ether");
  let amountOut;
  try {
    let router = await new web3.eth.Contract(
      pancakeSwapAbi,
      pancakeSwapContract
    );
    amountOut = await router.methods
      .getAmountsOut(bnbToSell, [BNBTokenAddress, BUSDTokenAddress])
      .call();
    amountOut = web3.utils.fromWei(amountOut[1]);
  } catch (error) {}
  if (!amountOut) return 0;
  return amountOut;
}
function setDecimals(number, decimals) {
  number = number.toString();
  let numberAbs = number.split(".")[0];
  let numberDecimals = number.split(".")[1] ? number.split(".")[1] : "";
  while (numberDecimals.length < decimals) {
    numberDecimals += "0";
  }
  return numberAbs + numberDecimals;
}
/*
How it works?
This script simply comunicates with the smart contract deployed by pancakeswap and calls the main
function that was build to retrieve the token prices
*/

(async () => {
  const tokenAddres = "0x2C717059b366714d267039aF8F59125CAdce6D8c"; // change this with the token addres that you want to know the price
  let amountToBuy = 1500;
  const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddres);
  const symbol = await tokenContract.methods.symbol().call();
  for (;;) {
    let bnbPrice = await calcBNBPrice(); // query pancakeswap to get the price of BNB in USDT
    let tokens_to_sell = 1;
    let priceInBNB =
      (await calcSell(tokens_to_sell, tokenAddres)) / tokens_to_sell; // calculate TOKEN price in BNB
    let priceInBNBFixed = priceInBNB.toFixed(5);
    let priceInUSD = (priceInBNB * bnbPrice).toFixed(3);
    let hours = new Date().getHours();
    let minutes = new Date().getMinutes();
    let seconds = new Date().getSeconds();
    let milliseconds = new Date().getMilliseconds();

    console.log(
      `${hours}:${minutes}:${seconds}.${milliseconds} - ${symbol} VALUE IN USD: $${priceInUSD} || VALUE IN BNB ${priceInBNBFixed} BNB || TOTAL USD TO SPEND $${
        amountToBuy * priceInUSD
      } || TOTAL BNB TO SPEND ${priceInBNBFixed * amountToBuy} BNB`
    );
  }
})();
